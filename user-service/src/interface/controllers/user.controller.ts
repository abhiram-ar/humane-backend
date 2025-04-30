import { IUserRepository } from '../../application/ports/IUserRepository';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserAuthController {
   constructor(private userRepository: IUserRepository) {}

   signup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
         const { firstName, lastName, email, password } = req.body;

         if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Required parameter missing' });
         }

         const passwordHash = await bcrypt.hash(
            password,
            parseInt(process.env.passwordSalt as string)
         );

         const newUser = await this.userRepository.create({
            firstName,
            lastName,
            email,
            passwordHash,
         });
		 
         res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: newUser },
         });
      } catch (error) {
         next(error);
      }
   };
}
