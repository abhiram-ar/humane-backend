import { AdminEmailLogin } from '@application/useCases/admin/AdminEmailLogin.usecase';
import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { ENV } from '@config/env';
import { JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { adminLoginSchema } from '@dtos/admin/adminLogin.dto';
import { signupAdminSchema } from '@dtos/admin/signupAdmin.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class AdminAuthController {
   constructor(
      private readonly createAdmin: CreateAdmin,
      private readonly adminEmailLogin: AdminEmailLogin
   ) {}

   signup = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = signupAdminSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const newAdmin = await this.createAdmin.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: 'admin signup successful',
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

         const { accessToken, refreshToken } = await this.adminEmailLogin.execute(parsed.data);

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
}
