import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateAnonCoverPhotoInputDTO } from '@dtos/anonymous/updateAnonCoverPhoto.input.dto';
import { IStorageService } from '@ports/IStorageService';

export class UpdateAnonCoverPhoto {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      anonId: string,
      dto: UpdateAnonCoverPhotoInputDTO
   ): Promise<{ updatedCoverPhotoKey: string; newCoverPhotoURL: string | undefined }> => {
      const resolvedAnon = await this._resolveAnonUser.execute(anonId);

      if (!resolvedAnon) {
         throw new UserNotFoundError('cannot resolve anon');
      }

      const update = await this._userRepository.updateCoverPhoto(
         resolvedAnon.userId,
         dto.newCoverPhotoKey
      );

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
