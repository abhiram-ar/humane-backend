import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../application/ports/IUserRepository';
import userModel, { IUser } from '../models/user.model';
import { createUserDTO } from '../../../../application/DTOs/user/createUser.dto';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';
import { FilterQuery } from 'mongoose';

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

   googleAuthCreate = async (
      dto: googleAuthDTO
   ): Promise<Pick<User, 'id' | 'isBlocked' | 'firstName' | 'email'>> => {
      const user = await userModel.create({
         email: dto.email,
         firstName: dto.firstName,
         avatar: dto.avaratURL,
      });

      return {
         id: user.id,
         firstName: user.firstName,
         email: user.email,
         isBlocked: user.isBlocked,
      };
   };

   getUserList = async (
      dto: GetUserDTO & { skip: number }
   ): Promise<{
      users: Pick<User, 'id' | 'email' | 'firstName' | 'isBlocked'>[];
      totalEntries: number;
   }> => {
      let filter: FilterQuery<IUser> = {};

      if (dto.searchQuery) {
         filter.$or = [
            { firstName: { $regex: dto.searchQuery, $options: 'i' } },
            { lastName: { $regex: dto.searchQuery, $options: 'i' } },
            { email: { $regex: dto.searchQuery, $options: 'i' } },
         ];
      }

      const userlist = await userModel
         .find(filter)
         .select('email firstName isBlocked')
         .skip(dto.skip)
         .limit(dto.limit);

      const parsedUserList = userlist.map((user) => ({
         id: user.id,
         firstName: user.firstName,
         email: user.email,
         isBlocked: user.isBlocked,
      }));

      const totalEntries = await userModel.countDocuments(filter);

      return { users: parsedUserList, totalEntries };
   };

   updateBlockStatus = async (
      userId: string,
      newStatus: boolean
   ): Promise<Pick<User, 'id' | 'email' | 'firstName' | 'isBlocked'> | null> => {
      const user = await userModel.findByIdAndUpdate(
         userId,
         { isBlocked: newStatus },
         { new: true }
      );

      if (!user) {
         return null;
      }

      return {
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         isBlocked: user.isBlocked,
      };
   };
}
