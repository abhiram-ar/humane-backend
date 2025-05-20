import { CreateUserDTO } from 'dto/createUser.dto';

export interface IUserRepository {
   create(dto: CreateUserDTO): Promise<{ ack: boolean }>;
}
