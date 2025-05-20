import { CreateUserDTO } from 'dto/createUser.dto';
import { IUserRepository } from 'repository/Interfaces/IUserRepository';

export class UserServices {
   constructor(private readonly _userRepository: IUserRepository) {}

   create = async (dto: CreateUserDTO): Promise<{ ack: boolean }> => {
      return await this._userRepository.create(dto);
   };
}
