import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UpdateAnonProfileInputDTO } from '@dtos/anonymous/updateAnonProfile.input.dto';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';

export class UpdateAnonProfile {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private readonly _userRepository: IUserRepository
   ) {}

   execute = async (
      anonId: string,
      dto: UpdateAnonProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName: string;
      bio: string;
   }> => {
      const resolvedAnon = await this._resolveAnonUser.execute(anonId);

      if (!resolvedAnon) {
         throw new UserNotFoundError('cannot resolve anon');
      }

      const updatedUserProfile = await this._userRepository.updateNameAndBio(
         resolvedAnon.userId,
         dto.firstName,
         dto.lastName,
         dto.bio
      );

      if (!updatedUserProfile) {
         throw new UserNotFoundError('Resolved anon->user does not exist');
      }

      return {
         firstName: updatedUserProfile.firstName,
         lastName: updatedUserProfile.lastName || '',
         bio: updatedUserProfile.bio || '',
      };
   };
}
