import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../application/ports/IUserRepository';
import userModel from '../models/user.model';
import { createUserDTO } from '../../../../application/DTOs/user/createUser.dto';

export class MongoUserRepository implements IUserRepository {
   constructor() {}

   create = async (dto: createUserDTO): Promise<Pick<User, 'firstName' | 'lastName' | 'email'>> => {
      const newUser = await userModel.create({
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash: dto.passwordHash,
      });

      return {
         firstName: newUser.firstName,
         lastName: newUser.lastName,
         email: newUser.email,
      };
   };

   emailExists = async (email: string): Promise<boolean> => {
      const user = await userModel.findOne({ email: email });
      return user ? true : false;
   };

   retriveUserByEmail = async (
      email: string
   ): Promise<Pick<User, 'id' | 'email' | 'passwordHash' | 'isBlocked'> | null> => {
      const user = await userModel.findOne({ email }, { email: 1, passwordHash: 1, isBlocked: 1 });
      if (!user) return null;

      return {
         id: user.id,
         email: user.email,
         passwordHash: user.passwordHash,
         isBlocked: user.isBlocked,
      };
   };

   getUserStatusById = async (userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null> => {
      const user = await userModel.findOne({ _id: userId });
      if (!user) return null;
      return { id: user.id, isBlocked: user.isBlocked };
   };

   changePassword = async (
      email: string,
      newPasswordHash: string
   ): Promise<Pick<User, 'email'> | null> => {
      const user = await userModel.findOneAndUpdate(
         { email: email },
         { passwordHash: newPasswordHash },
         { new: true }
      );

      if (!user) return null;
      return { email: user.email };
   };
}
