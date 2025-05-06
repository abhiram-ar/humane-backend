import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';

export interface IUserRepository {
   create(dto: createUserDTO): Promise<Pick<User, 'firstName' | 'lastName' | 'email'>>;

   emailExists(email: string): Promise<boolean>;

   retriveUserByEmail(
      email: string
   ): Promise<Pick<User, 'id' | 'email' | 'passwordHash' | 'isBlocked'> | null>;

   getUserStatusById(userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null>;

   changePassword(email: string, newPasswordHash: string): Promise<Pick<User, 'email'> | null>;

   googleAuthCreate(
      dto: googleAuthDTO
   ): Promise<Pick<User, 'id' | 'isBlocked' | 'firstName' | 'email'>>;

   getUserList(dto: GetUserDTO & { skip: number }): Promise<{
      users: Pick<User, 'id' | 'email' | 'firstName' | 'isBlocked'>[];
      totalEntries: number;
   }>;

   updateBlockStatus(
      userId: string,
      newStatus: boolean
   ): Promise<Pick<User, 'id' | 'email' | 'firstName' | 'isBlocked'> | null>;
}
