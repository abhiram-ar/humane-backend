import { logger } from '@config/logger';
import { UpdateUserAvatarKeyDTO } from '@dtos/updateUserAvatarKey.dto';
import { UpdaeteUserBlockStautsDTO } from '@dtos/updateUserBlockStatus.dto';
import { UpdateUserCoverPhotoKeyDTO } from '@dtos/updateUserCoverPhotokey';
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

   updateUserAvatarKey = async (eventTimestamp: string, dto: UpdateUserAvatarKeyDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserAvatarKeyCommand(eventTimestamp, dto.id, dto.avatarKey);
      } else {
         logger.warn('Skipping avatarKey update. Reason: old event');
      }
   };

   updateUserCoverPhotoKey = async (eventTimestamp: string, dto: UpdateUserCoverPhotoKeyDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserCoverPhotoKeyCommand(
            eventTimestamp,
            dto.id,
            dto.coverPhotoKey
         );
      } else {
         logger.warn('Skipping coverPhotoKey update. Reason: old event');
      }
   };

   updateBlockStatus = async (eventTimestamp: string, dto: UpdaeteUserBlockStautsDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserBlockStatusCommand(eventTimestamp, dto.id, dto.isBlocked);
      } else {
         logger.warn('Skipping blockstatus update. Reason: old event');
      }
   };
}
