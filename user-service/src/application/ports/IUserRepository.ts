import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';

export interface IUserRepository {
   create(dto: createUserDTO): Promise<Pick<User, 'firstName' | 'lastName' | 'email'>>;

   emailExists(email: string): Promise<boolean>;

   retriveUserByEmail(
      email: string
   ): Promise<Pick<User, 'id' | 'email' | 'passwordHash' | 'isBlocked'> | null>;

   getUserStatusById(userId: string): Promise<Pick<User, 'id' | 'isBlocked'> | null>;

   changePassword(email: string, newPasswordHash: string): Promise<Pick<User, 'email'> | null>;

   googleAuthCreate(dto: googleAuthDTO): Promise<Pick<User, "id" | "isBlocked" |'firstName' | 'email'>>;
}
