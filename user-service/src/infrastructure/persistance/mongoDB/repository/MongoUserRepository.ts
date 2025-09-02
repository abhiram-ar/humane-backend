import { User } from '../../../../domain/entities/user.entity';
import userModel, { IUser } from '../models/user.model';
import { createUserDTO } from '../../../../application/DTO-mapper/user/createUser.dto';
import { googleAuthDTO } from '@application/DTO-mapper/user/googleAuth.dto';
import { AdminGetUserResponseDTO, GetUserDTO } from '@application/DTO-mapper/admin/getUsers.dto';
import { FilterQuery } from 'mongoose';

export class MongoUserRepository {
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
      users: AdminGetUserResponseDTO[];
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
         .select('firstName lastName email isBlocked isHotUser createdAt humaneScore')
         .skip(dto.skip)
         .limit(dto.limit);

      const parsedUserList: AdminGetUserResponseDTO[] = userlist.map((user) => ({
         email: user.email,
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName,
         isBlocked: user.isBlocked,
         isHotUser: user.isHotUser,
         createdAt: user.createdAt,
         humaneScore: user.humaneScore,
      }));

      const totalEntries = await userModel.countDocuments(filter);

      return { users: parsedUserList, totalEntries };
   };

   updateBlockStatus = async (
      userId: string,
      newStatus: boolean
   ): Promise<AdminGetUserResponseDTO | null> => {
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
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email,
         isBlocked: user.isBlocked,
         isHotUser: user.isHotUser,
         createdAt: user.createdAt,
         humaneScore: user.humaneScore,
      };
   };

   retriveUserById = async (userId: string): Promise<User | null> => {
      const retrivedUser = await userModel.findById(userId);

      if (!retrivedUser) return null;

      return new User(
         retrivedUser.id,
         retrivedUser.firstName,
         retrivedUser.email,
         retrivedUser.isEmailVerified,
         retrivedUser.isBlocked,
         retrivedUser.humaneScore,
         retrivedUser.isHotUser,
         retrivedUser.createdAt,
         retrivedUser.lastLoginTime,
         retrivedUser.avatar,
         retrivedUser.coverPhoto,
         retrivedUser.lastName,
         retrivedUser.passwordHash,
         retrivedUser.bio
      );
   };

   updateNameAndBio = async (
      userId: string,
      firstName: string,
      lastName: string,
      bio: string
   ): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'bio'> | null> => {
      const updatedUser = await userModel.findByIdAndUpdate(
         userId,
         { firstName, lastName, bio },
         { new: true }
      );

      if (!updatedUser) return null;

      return {
         id: updatedUser.id,
         firstName: updatedUser.firstName,
         lastName: updatedUser.lastName,
         bio: updatedUser.bio,
      };
   };

   updateAvatar = async (
      userId: string,
      newAvatarKey: string
   ): Promise<{ updatedAvatarKey: string } | null> => {
      const update = await userModel.findByIdAndUpdate(
         userId,
         { avatar: newAvatarKey },
         { new: true }
      );

      if (!update) return null;

      return { updatedAvatarKey: update.avatar as string };
   };

   updateCoverPhoto = async (
      userId: string,
      newCoverPhotoKey: string
   ): Promise<{ updatedCoverPhotoKey: string } | null> => {
      const update = await userModel.findByIdAndUpdate(
         userId,
         { coverPhoto: newCoverPhotoKey },
         { new: true }
      );

      if (!update) return null;

      return { updatedCoverPhotoKey: update.coverPhoto as string };
   };
}
