import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GetCurrentAnonProfileInputDTO } from '@dtos/anonymous/getCurrentAnonProfile.input.dto';
import { IStorageService } from '@ports/IStorageService';

export class GetCurrentAnonProfile {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      dto: GetCurrentAnonProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName?: string;
      bio?: string;
      avatarURL?: string;
      coverPhotoURL?: string;
      createdAt: string;
      humaneScore: number;
   }> => {
      const resolvedAnon = await this._resolveAnonUser.execute(dto.anonId);

      if (!resolvedAnon) {
         throw new UserNotFoundError('Invalid anonId');
      }

      const currentUser = await this._userRepository.retriveUserById(resolvedAnon.userId);

      if (!currentUser) {
         throw new UserNotFoundError('Resolved anon->user does not exist');
      }

      let avatarURL: string | undefined;
      if (currentUser.avatar) {
         avatarURL = this._storageService.getPublicCDNURL(currentUser.avatar);
      }

      let coverPhotoURL: string | undefined;
      if (currentUser.coverPhoto) {
         coverPhotoURL = this._storageService.getPublicCDNURL(currentUser.coverPhoto);
      }

      return {
         firstName: currentUser.firstName,
         lastName: currentUser.lastName,
         bio: currentUser.bio,
         avatarURL,
         coverPhotoURL,
         createdAt: currentUser.createdAt,
         humaneScore: currentUser.humaneScore,
      };
   };
}
