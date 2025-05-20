import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { AdminGetUserResponseDTO, GetUserDTO } from '@dtos/admin/getUsers.dto';

export interface IUserRepository {
   create(
      dto: createUserDTO
   ): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isBlocked' | 'isHotUser'>>;

   emailExists(email: string): Promise<boolean>;

   retriveUserByEmail(
      email: string
   ): Promise<Pick<
      User,
      'id' | 'email' | 'passwordHash' | 'isBlocked' | 'firstName' | 'lastName' | 'isHotUser'
   > | null>;

   getUserStatusById(userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null>;

   changePassword(email: string, newPasswordHash: string): Promise<Pick<User, 'email'> | null>;

   googleAuthCreate(
      dto: googleAuthDTO
   ): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'isBlocked' | 'isHotUser'>>;

   getUserList(dto: GetUserDTO & { skip: number }): Promise<{
      users: AdminGetUserResponseDTO[];
      totalEntries: number;
   }>;

   updateBlockStatus(userId: string, newStatus: boolean): Promise<AdminGetUserResponseDTO | null>;

   retriveUserById(userId: string): Promise<User | null>;

   updateNameAndBio(
      userId: string,
      firstName: string,
      lastName: string,
      bio: string
   ): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'bio'> | null>;

   updateAvatar(userId: string, newAvatarKey: string): Promise<{ updatedAvatarKey: string } | null>;

   updateCoverPhoto(
      userId: string,
      newCoverPhotoKey: string
   ): Promise<{ updatedCoverPhotoKey: string } | null>;
}
