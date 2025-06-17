import { NextFunction, Request, Response } from 'express';
import { signupUserSchema } from '@application/DTOs/user/signupUser.dto';
import { verifyUserSchema } from '@application/DTOs/user/verifyUser.dto';
import { VerifyUser } from '@application/useCases/user/VerifyUser.usecase';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { SignupUser } from '@application/useCases/user/SignupUser.usecase';
import { UserEmailLogin } from '@application/useCases/user/UserEmailLogin.usecase';
import { RefreshUserAccessToken } from '@application/useCases/user/RefreshUserToken.usecase';
import { userLoginSchema } from '@dtos/user/userLogin.dto';
import { JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { ENV } from '@config/env';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { forgotPasswordSchema } from '@dtos/user/forgotPassword.dto';
import { ForgotPassword } from '@application/useCases/user/ForgotPassword.usecase';
import { RecoverPassword } from '@application/useCases/user/RecoverPassword.usecase';
import { recoverPasswordSchema } from '@dtos/user/recoverPassword.dto';
import { OAuth2Client } from 'google-auth-library';
import { GenericError } from '@application/errors/GenericError';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { UserGoogleAuth } from '@application/useCases/user/googleAuth.usecase';
import { HttpStatusCode } from 'axios';

export class UserAuthController {
   constructor(
      private readonly _singupUser: SignupUser,
      private readonly _verifyUser: VerifyUser,
      private readonly _userEmailLogin: UserEmailLogin,
      private readonly _refreshUserAccessToken: RefreshUserAccessToken,
      private readonly _forgotPassoword: ForgotPassword,
      private readonly _recoverPassword: RecoverPassword,
      private readonly _googleAuth2Client: OAuth2Client,
      private readonly _userGooglgAuth: UserGoogleAuth
   ) {}

   signup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const parsed = signupUserSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const signupToken = await this._singupUser.execute(parsed.data);

         res.status(HttpStatusCode.Accepted).json({
            data: { token: signupToken },
         });
      } catch (error) {
         next(error);
      }
   };

   verify = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const parsed = verifyUserSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const newUser = await this._verifyUser.execute(parsed.data);

         res.status(HttpStatusCode.Created).json({
            data: { user: newUser },
         });
      } catch (error) {
         next(error);
      }
   };

   login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const parsed = userLoginSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { refreshToken, accessToken } = await this._userEmailLogin.execute(parsed.data);

         console.log(ENV.NODE_ENV);

         res.cookie('refreshJWT', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production' ? true : false,
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: JWT_REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
         });

         res.status(HttpStatusCode.Ok).json({
            data: { accessToken },
         });
      } catch (error) {
         next(error);
      }
   };

   refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const { refreshJWT } = req.cookies;
         if (!refreshJWT) {
            throw new UnAuthenticatedError('refresh token not found in cookies');
         }

         const { newAccessToken } = await this._refreshUserAccessToken.execute(refreshJWT);

         res.status(HttpStatusCode.Ok).json({
            data: { token: newAccessToken },
         });
      } catch (error) {
         if (
            error instanceof JWTRefreshError ||
            error instanceof UserNotFoundError ||
            error instanceof UserBlockedError
         ) {
            console.error(error.message);
            res.clearCookie('refreshJWT', {
               httpOnly: true,
               secure: ENV.NODE_ENV === 'production' ? true : false,
               sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            });
         }
         next(error);
      }
   };

   logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const { refreshJWT } = req.cookies;
         if (!refreshJWT) {
            throw new UnAuthenticatedError('refresh token not found in cookies');
         }

         res.clearCookie('refreshJWT', {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production' ? true : false,
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
         });
         res.status(HttpStatusCode.Ok).json({});
      } catch (error) {
         if (error instanceof UnAuthenticatedError) {
            return res.status(HttpStatusCode.Ok).json({
               success: true,
               message: `${error.message},User is not authenticated to logout`,
            });
         }
         next(error);
      }
   };

   forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = forgotPasswordSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { email } = await this._forgotPassoword.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: `password recovery send to ${email}`,
         });
      } catch (error) {
         next(error);
      }
   };

   resetPassword = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = recoverPasswordSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { email } = await this._recoverPassword.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: 'password changed successfully',
            data: { email },
         });
      } catch (error) {
         next(error);
      }
   };

   googleAuth = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { credentials } = req.body;

         if (!credentials) {
            throw new GenericError('Cannot find credentials in request body');
         }

         const verifiedToken = await this._googleAuth2Client.verifyIdToken({
            idToken: credentials,
            audience: ENV.GOOGLE_CLIENT_ID,
         });

         const payload = verifiedToken.getPayload();
         if (!payload) {
            throw new GenericError('Invalid 0Auth2Token');
         }

         if (!payload.email) {
            throw new GenericError('OAuthpayload does not contain email');
         }

         const googleAuthDTO: googleAuthDTO = {
            email: payload.email,
            firstName: payload.name || 'anon',
            avaratURL: payload.picture,
         };

         const { accessToken, refreshToken } = await this._userGooglgAuth.execute(googleAuthDTO);

         res.cookie('refreshJWT', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production' ? true : false,
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: JWT_REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
         });

         res.status(200).json({
            success: true,
            message: 'User google login successful',
            data: { accessToken },
         });
      } catch (error) {
         next(error);
      }
   };
}
