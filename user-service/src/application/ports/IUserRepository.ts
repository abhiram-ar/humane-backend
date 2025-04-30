import { createUserDTO } from '../DTOs/user/createUser.dto';
import { User } from '../../domain/entities/user.entity';

export interface IUserRepository {
   create(dto: createUserDTO): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>>;
   emailExists(email: string): Promise<boolean>;
}
