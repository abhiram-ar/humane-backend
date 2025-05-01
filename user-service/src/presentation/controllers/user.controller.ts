import { NextFunction, Request, Response } from 'express';
import { SignupUser } from '../../application/useCases/SignupUser.usecase';
import { signupUserSchema } from '../../application/DTOs/user/signupUser.dto';
import { verifyUserSchema } from '../../application/DTOs/user/verifyUser.dto';
import { VerifyUser } from '../../application/useCases/VerifyUser.usecase';
import { ZodValidationError } from '../errors/ZodValidationError';
import { userLoginSchema } from '../../application/DTOs/user/userLogin.dto';
import { UserEmailLogin } from '../../application/useCases/UserEmailLogin.usecase';
import { ENV } from '../../config/env';
import { JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '../../config/jwt';
import { RefreshUserToken } from '../../application/useCases/RefreshUserToken.usecase';
import { UnAuthenticatedError } from '../../application/errors/UnAuthenticatedError';
import { JWTRefreshError } from '../../application/errors/JWTRefreshError';
import { UserNotFoundError } from '../../application/errors/UserNotFoundError';
import { UserBlockedError } from '../../application/errors/UserBlockedError';

export class UserAuthController {
   constructor(
      private readonly singupUser: SignupUser,
      private readonly verifyUser: VerifyUser,
      private readonly userEmailLogin: UserEmailLogin,
      private readonly refreshUserAccessToken: RefreshUserToken
   ) {}

   signup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const parsed = signupUserSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const signupToken = await this.singupUser.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: 'User singup token created successfully',
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

         const newUser = await this.verifyUser.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: 'email verification success',
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

         const { refreshToken, accessToken } = await this.userEmailLogin.execute(parsed.data);

         res.cookie('refreshJWT', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production' ? true : false,
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: JWT_REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
         });

         res.status(200).json({
            success: true,
            message: 'User email login successful',
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

         const { newAccessToken } = await this.refreshUserAccessToken.execute(refreshJWT);

         res.status(200).json({
            success: true,
            message: 'Access token refreshed',
            data: { token: newAccessToken },
         });

         console.log(refreshJWT);
      } catch (error) {
         if (
            error instanceof JWTRefreshError ||
            error instanceof UserNotFoundError ||
            error instanceof UserBlockedError
         ) {
            res.clearCookie('refreshJWT', {
               httpOnly: true,
               secure: ENV.NODE_ENV === 'production' ? true : false,
               sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            });
         }
         next(error);
      }
   };
}
