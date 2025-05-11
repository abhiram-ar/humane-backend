import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateAnonCoverPhotoInputDTO } from '@dtos/anonymous/updateAnonCoverPhoto.input.dto';

export class UpdateAnonCoverPhoto {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private _userRepository: IUserRepository
   ) {}

   execute = async (
      anonId: string,
      dto: UpdateAnonCoverPhotoInputDTO
   ): Promise<{ updatedCoverPhotoKey: string }> => {
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

      return { updatedCoverPhotoKey: update.updatedCoverPhotoKey };
   };
}
