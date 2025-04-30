import { NextFunction, Request, Response } from 'express';
import { SignupUser } from '../../application/useCases/SignupUser.usecase';
import { signupUserSchema } from '../../application/DTOs/user/signupUser.dto';
import { verifyUserSchema } from '../../application/DTOs/user/verifyUser.dto';
import { VerifyUser } from '../../application/useCases/VerifyUser.usecase';

export class UserAuthController {
   constructor(private readonly singupUser: SignupUser, private readonly verifyUser: VerifyUser) {}

   signup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const parsed = signupUserSchema.safeParse(req.body);

         if (!parsed.success) {
            return res
               .status(400)
               .json({ success: false, message: 'error in request schema', errors: parsed.error });
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
            return res
               .status(400)
               .json({ success: true, message: 'error in request schema', errors: parsed.error });
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
}
