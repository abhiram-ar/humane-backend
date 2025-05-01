import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';

export interface IUserRepository {
   create(dto: createUserDTO): Promise<Pick<User, 'firstName' | 'lastName' | 'email'>>;
   emailExists(email: string): Promise<boolean>;
   retriveUserByEmail(email: string): Promise<Pick<User, 'id' | 'email' | 'passwordHash'> | null>;
}
