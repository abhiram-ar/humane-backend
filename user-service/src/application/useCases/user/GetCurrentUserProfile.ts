import { IUserRepository } from '@ports/IUserRepository';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GetCurrentAnonProfileInputDTO } from '@application/DTO-mapper/user/getCurrentAnonProfile.input.dto';
import { IStorageService } from '@ports/IStorageService';
import { IGetCurrentUserProfile } from '@ports/usecases/user/IGetCurrentUserProfile';

export class GetCurrentUserProfile implements IGetCurrentUserProfile {
   constructor(
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
      const currentUser = await this._userRepository.retriveUserById(dto.userId);

      if (!currentUser) {
         throw new UserNotFoundError('User does not exist');
      }

      let avatarURL: string | undefined;
      if (currentUser.avatarKey) {
         avatarURL = this._storageService.getPublicCDNURL(currentUser.avatarKey);
      }

      let coverPhotoURL: string | undefined;
      if (currentUser.coverPhotoKey) {
         coverPhotoURL = this._storageService.getPublicCDNURL(currentUser.coverPhotoKey);
      }

      return {
         firstName: currentUser.firstName,
         lastName: currentUser.lastName ?? undefined,
         bio: currentUser.bio ?? undefined,
         avatarURL,
         coverPhotoURL,
         createdAt: currentUser.createdAt,
         humaneScore: currentUser.humaneScore,
      };
   };
}
