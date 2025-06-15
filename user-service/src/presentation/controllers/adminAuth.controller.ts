import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { RefreshAdminAccessToken } from '@application/useCases/admin/RefreshAdminToken.usecase';
import { ENV } from '@config/env';
import { JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { adminLoginSchema } from '@dtos/admin/adminLogin.dto';
import { signupAdminSchema } from '@dtos/admin/signupAdmin.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export class AdminAuthController {
   constructor(
      private readonly _createAdmin: CreateAdmin,
      private readonly _adminEmailLogin: AdminEmailLogin,
      private readonly _refreshToken: RefreshAdminAccessToken
   ) {}

   signup = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = signupAdminSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const newAdmin = await this._createAdmin.execute(parsed.data);

         res.status(HttpStatusCode.Created).json({
            data: newAdmin,
         });
      } catch (error) {
         next(error);
      }
   };

   login = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = adminLoginSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { accessToken, refreshToken } = await this._adminEmailLogin.execute(parsed.data);

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

   refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { refreshJWT } = req.cookies;
         if (!refreshJWT) {
            throw new UnAuthenticatedError('refresh token not found in cookies');
         }

         const { newAccessToken } = await this._refreshToken.execute(refreshJWT);

         res.status(HttpStatusCode.Ok).json({
            data: { token: newAccessToken },
         });
      } catch (error) {
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
         res.status(HttpStatusCode.Ok).json({ message: 'User logout successful' });
      } catch (error) {
         if (error instanceof UnAuthenticatedError) {
            return res.status(HttpStatusCode.Ok).json({
               message: `${error.message},User is not authenticated to logout`,
            });
         }
         next(error);
      }
   };
}
