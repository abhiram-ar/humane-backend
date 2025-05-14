import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateAnonAvatarInputDTO } from '@dtos/anonymous/updateAnonProfileAvatar.input.dto';
import { IStorageService } from '@ports/IStorageService';

export class UpdateAnonAvatar {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      anonId: string,
      dto: UpdateAnonAvatarInputDTO
   ): Promise<{ updatedAvatarKey: string; newAvatarURL: string | undefined }> => {
      const resolvedAnon = await this._resolveAnonUser.execute(anonId);

      if (!resolvedAnon) {
         throw new UserNotFoundError('cannot resolve anon');
      }

      const update = await this._userRepository.updateAvatar(resolvedAnon.userId, dto.newAvatarKey);

      if (!update) {
         throw new UserNotFoundError('unable to update avatar of resolved anon');
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
