import { IUserRepository } from '@ports/IUserRepository';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateUserAvatarInputDTO } from '@dtos/user/updateAnonProfileAvatar.input.dto';
import { IStorageService } from '@ports/IStorageService';

export class UpdateUserAvatar {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      userId: string,
      dto: UpdateUserAvatarInputDTO
   ): Promise<{ updatedAvatarKey: string; newAvatarURL: string | undefined }> => {
      const update = await this._userRepository.updateAvatar(userId, dto.newAvatarKey);

      if (!update) {
         throw new UserNotFoundError('unable to update avatar of  user');
      }

      // if the client remove the avatar photo be setting newAvatarKey as "",
      // we dont want to generete a CND link for a invalid key
      let newAvatarURL: string | undefined;
      if (update.updatedAvatarKey) {
         newAvatarURL = this._storageService.getPublicCDNURL(update.updatedAvatarKey);
      }

      return { updatedAvatarKey: update.updatedAvatarKey, newAvatarURL };
   };
}
