import { User } from '@domain/entities/user.entity';
import { GetUserDTO, AdminGetUserResponseDTO } from '@dtos/admin/getUsers.dto';
import { createUserDTO } from '@dtos/user/createUser.dto';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { IUserRepository } from '@ports/IUserRepository';
import db from '../prisma-client';

export class PostresUserRepository implements IUserRepository {
   create = async (dto: createUserDTO): Promise<Omit<User, 'passwordHash'>> => {
      const res = await db.user.create({
         data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash: dto.passwordHash,
         },
      });

      return {
         ...res,
         createdAt: res.createdAt.toISOString(),
         lastLoginTime: res.lastLoginTime.toISOString(),
      };
   };

   emailExists = async (email: string): Promise<boolean> => {
      const res = await db.user.findUnique({ where: { email } });
      return res ? true : false;
   };

   retriveUserByEmail = async (
      email: string
   ): Promise<Pick<
      User,
      'id' | 'firstName' | 'lastName' | 'email' | 'passwordHash' | 'isBlocked' | 'isHotUser'
   > | null> => {
      const res = await db.user.findUnique({
         where: { email },
         select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            passwordHash: true,
            isBlocked: true,
            isHotUser: true,
         },
      });

      if (!res) return null;

      return {
         id: res.id,
         firstName: res.firstName,
         lastName: res.lastName ?? undefined,
         email: res.email,
         passwordHash: res.passwordHash ?? undefined,
         isBlocked: res.isBlocked,
         isHotUser: res.isHotUser,
      };
   };
   getUserStatusById = async (userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null> => {
      const res = await db.user.findUnique({
         where: { id: userId },
         select: { id: true, isBlocked: true },
      });

      if (!res) return null;

      return { id: res.id, isBlocked: res.isBlocked };
   };

   changePassword = async (
      email: string,
      newPasswordHash: string
   ): Promise<Pick<User, 'email'> | null> => {
      const res = await db.user.update({
         where: { email },
         data: { passwordHash: newPasswordHash },
      });

      if (!res) return null;

      return { email: res.email };
   };

   googleAuthCreate = async (
      dto: googleAuthDTO
   ): Promise<
      Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isBlocked' | 'isHotUser'>
   > => {
      const res = await db.user.create({ data: { firstName: dto.firstName, email: dto.email } });
      return {
         id: res.id,
         firstName: res.firstName,
         lastName: res.lastName ?? undefined,
         email: res.email,
         isBlocked: res.isBlocked,
         isHotUser: res.isHotUser,
      };
   };

   getUserList = async (
      dto: GetUserDTO & { skip: number }
   ): Promise<{ users: AdminGetUserResponseDTO[]; totalEntries: number }> => {
      const searchQuery = dto.searchQuery?.toLocaleLowerCase() || '';

      const whereClause: NonNullable<Parameters<typeof db.user.findMany>[0]>['where'] = searchQuery
         ? {
              OR: [
                 { firstName: { contains: searchQuery, mode: 'insensitive' } },
                 { lastName: { contains: searchQuery, mode: 'insensitive' } },
                 { email: { contains: searchQuery, mode: 'insensitive' } },
              ],
           }
         : {};

      const [userlist, totalEntries] = await Promise.all([
         db.user.findMany({
            where: whereClause,
            omit: { passwordHash: true },
            skip: dto.skip,
            take: dto.limit,
         }),
         db.user.count({ where: whereClause }),
      ]);

      const parsedUserList: AdminGetUserResponseDTO[] = userlist.map((user) => ({
         email: user.email,
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName ?? undefined,
         isBlocked: user.isBlocked,
         isHotUser: user.isHotUser,
         createdAt: user.createdAt.toISOString(),
         humaneScore: user.humaneScore,
      }));

      return { users: parsedUserList, totalEntries };
   };

   updateBlockStatus = async (
      userId: string,
      newStatus: boolean
   ): Promise<AdminGetUserResponseDTO | null> => {
      const res = await db.user.update({ where: { id: userId }, data: { isBlocked: newStatus } });
      if (!res) return null;

      return {
         id: res.id,
         firstName: res.firstName,
         lastName: res.lastName ?? undefined,
         email: res.email,
         isBlocked: res.isBlocked,
         isHotUser: res.isHotUser,
         createdAt: res.createdAt.toUTCString(),
         humaneScore: res.humaneScore,
      };
   };

   retriveUserById = async (userId: string): Promise<User | null> => {
      const res = await db.user.findUnique({ where: { id: userId } });
      if (!res) return null;

      return new User(
         res.id,
         res.firstName,
         res.email,
         res.isEmailVerified,
         res.isBlocked,
         res.humaneScore,
         res.isHotUser,
         res.createdAt.toUTCString(),
         res.lastLoginTime.toUTCString(),
         res.avatarKey ?? undefined,
         res.coverPhotoKey ?? undefined,
         res.lastName ?? undefined,
         res.passwordHash ?? undefined,
         res.bio
      );
   };
   updateNameAndBio = async (
      userId: string,
      firstName: string,
      lastName: string,
      bio: string
   ): Promise<Omit<User, 'passwordHash'> | null> => {
      const res = await db.user.update({
         where: { id: userId },
         data: { firstName, lastName, bio },
      });

      if (!res) return null;

      return {
         ...res,
         createdAt: res.createdAt.toISOString(),
         lastLoginTime: res.lastLoginTime.toISOString(),
      };
   };
   updateAvatar = async (
      userId: string,
      newAvatarKey: string
   ): Promise<{ updatedAvatarKey: string } | null> => {
      const res = await db.user.update({
         where: { id: userId },
         data: { avatarKey: newAvatarKey },
         select: { avatarKey: true },
      });

      if (!res) return null;

      return { updatedAvatarKey: res.avatarKey as string };
   };
   updateCoverPhoto = async (
      userId: string,
      newCoverPhotoKey: string
   ): Promise<{ updatedCoverPhotoKey: string } | null> => {
      const res = await db.user.update({
         where: { id: userId },
         data: { coverPhotoKey: newCoverPhotoKey },
         select: { coverPhotoKey: true },
      });

      if (!res) return null;
      return { updatedCoverPhotoKey: res.coverPhotoKey as string };
   };
}
