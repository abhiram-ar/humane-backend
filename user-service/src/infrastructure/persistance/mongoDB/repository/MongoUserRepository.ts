import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../application/ports/IUserRepository';
import userModel from '../models/user.model';
import { createUserDTO } from '../../../../application/DTOs/user/createUser.dto';

export class MongoUserRepository implements IUserRepository {
   constructor() {}

   create = async (
      dto: createUserDTO
   ): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>> => {
      const newUser = await userModel.create({
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash: dto.passwordHash,
      });

      return {
         id: newUser.id,
         firstName: newUser.firstName,
         lastName: newUser.lastName,
         email: newUser.email,
      };
   };

   emailExists = async (email: string): Promise<boolean> => {
      const user = await userModel.findOne({ email: email });
      return user ? true : false;
   };
}
