import { logger } from '@config/logger';
import { UpdateNameAndBioDTO } from '@dtos/updateUserNameBio.dto';
import { CreateUserDTO } from 'dto/createUser.dto';
import { IUserRepository } from 'repository/Interfaces/IUserRepository';

export class UserServices {
   constructor(private readonly _userRepository: IUserRepository) {}

   create = async (dto: CreateUserDTO): Promise<void> => {
      await this._userRepository.createCommand(dto);
   };

   updateNameAndBio = async (eventTimeStamp: string, dto: UpdateNameAndBioDTO) => {
      const incomingTimestamp = new Date(eventTimeStamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }

      const currnentTimeStamp = new Date(res.updatedAt ?? 0); // in case updateAT does not exist

      if (incomingTimestamp > currnentTimeStamp) {
         this._userRepository.updateNameAndBioCommand(eventTimeStamp, dto);
      } else {
         logger.warn('Skipping name/bio update. Reason: old event');
      }
   };
}
