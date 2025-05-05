import { CreateAdmin } from '@application/useCases/admin/createNewAdmin.usercase';
import { signupAdminSchema } from '@dtos/admin/signupAdmin.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class AdminAuthController {
   constructor(private readonly createAdmin: CreateAdmin) {}

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
}
