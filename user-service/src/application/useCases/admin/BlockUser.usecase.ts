import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateUserBlockStatusDTO } from '@dtos/admin/updateUserBlockStatus.dto';
import { IUserRepository } from '@ports/IUserRepository';

export class AdminUpdateUserBlockStatus {
   constructor(private readonly _userRepository: IUserRepository) {}

   execute = async (dto: UpdateUserBlockStatusDTO) => {
      const user = await this._userRepository.updateBlockStatus(dto.userId, dto.newBlockStatus);

      if (!user) {
         throw new UserNotFoundError('Invalid userID');
      }

      return user;
   };
}
