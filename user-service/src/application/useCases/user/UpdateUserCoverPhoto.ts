import { IUserRepository } from '@ports/IUserRepository';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateUserCoverPhotoInputDTO } from '@dtos/user/updateUserCoverPhoto.input.dto';
import { IStorageService } from '@ports/IStorageService';

export class UpdateUserCoverPhoto {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      userId: string,
      dto: UpdateUserCoverPhotoInputDTO
   ): Promise<{ updatedCoverPhotoKey: string; newCoverPhotoURL: string | undefined }> => {
      const update = await this._userRepository.updateCoverPhoto(userId, dto.newCoverPhotoKey);

      if (!update) {
         throw new UserNotFoundError('unable to update avatar of resolved anon');
      }

      // if the client remove the avatar photo be setting newAvatarKey as "",
      // we dont want to generete a CND link for a invalid key
      let newCoverPhotoURL: string | undefined;
      if (update.updatedCoverPhotoKey) {
         newCoverPhotoURL = this._storageService.getPublicCDNURL(update.updatedCoverPhotoKey);
      }

      return { updatedCoverPhotoKey: update.updatedCoverPhotoKey, newCoverPhotoURL };
   };
}
