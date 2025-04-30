import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';

export class UserAuthController {
  constructor(private userRepository: IUserRepository) {}

  signup = async (req: Request, res: Response): Promise<any> => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Required parameter missing' });
    }

    if (!process.env.passwordSalt) {
      throw new Error('password salt not in env');
    }
    console.log('salt', process.env.passwordSalt);
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.passwordSalt as string));
    console.log('hash', passwordHash);

    const newUser = await this.userRepository.create({ firstName, lastName, email, passwordHash });

    res
      .status(201)
      .json({ success: true, message: 'User created successfully', data: { user: newUser } });
  };
}
