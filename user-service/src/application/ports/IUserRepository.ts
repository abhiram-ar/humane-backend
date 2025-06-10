import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { AdminGetUserResponseDTO, GetUserDTO } from '@dtos/admin/getUsers.dto';

export interface IUserRepository {
   create(dto: createUserDTO): Promise<User>;
   emailExists(email: string): Promise<boolean>;

   retriveUserByEmail(email: string): Promise<User | null>;

   getUserStatusById(userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null>;

   changePassword(email: string, newPasswordHash: string): Promise<Pick<User, 'email'> | null>;

   googleAuthCreate(dto: googleAuthDTO): Promise<Omit<User, 'passwordHash'>>;

   getUserList(dto: GetUserDTO & { skip: number }): Promise<{
      users: AdminGetUserResponseDTO[];
      totalEntries: number;
   }>;

   getUserListByIds(userIds: string[]): Promise<AdminGetUserResponseDTO[]>;

   updateBlockStatus(userId: string, newStatus: boolean): Promise<AdminGetUserResponseDTO | null>;

   retriveUserById(userId: string): Promise<User | null>;

   updateNameAndBio(
      userId: string,
      firstName: string,
      lastName: string,
      bio: string
   ): Promise<User | null>;

   updateAvatar(userId: string, newAvatarKey: string): Promise<{ updatedAvatarKey: string } | null>;

   updateCoverPhoto(
      userId: string,
      newCoverPhotoKey: string
   ): Promise<{ updatedCoverPhotoKey: string } | null>;

   isHotUser(userId: string): Promise<boolean | null>;
}
