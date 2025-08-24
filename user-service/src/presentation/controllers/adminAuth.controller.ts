import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { ENV } from '@config/env';
import { JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { adminLoginSchema } from '@dtos/admin/adminLogin.dto';
import { signupAdminSchema } from '@dtos/admin/signupAdmin.dto';
import { IAdminEmailLogin } from '@ports/usecases/admin/IAdminEmailLogin';
import { ICreateAdmin } from '@ports/usecases/admin/ICreateNewAdmin.usercase';
import { IRefreshAdminAccessToken } from '@ports/usecases/admin/IRefreshAdminToken.usecase';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { IAdminAuthController } from '@presentation/interface/IAdminAuth.controller';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

export class AdminAuthController implements IAdminAuthController {
   constructor(
      private readonly _createAdmin: ICreateAdmin,
      private readonly _adminEmailLogin: IAdminEmailLogin,
      private readonly _refreshToken: IRefreshAdminAccessToken
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
