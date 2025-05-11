import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from './ResolveAnonymousUser.usecase';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GetCurrentAnonProfileInputDTO } from '@dtos/anonymous/getCurrentAnonProfile.input.dto';

export class GetCurrentAnonProfile {
   constructor(
      private readonly _resolveAnonUser: ResolveAnoymousUser,
      private readonly _userRepository: IUserRepository
   ) {}

   execute = async (
      dto: GetCurrentAnonProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName?: string;
      bio?: string;
      avatarId?: string;
      coverPhoto?: string;
      createdAt: string;
      humaneScore: number
   }> => {
      const resolvedAnon = await this._resolveAnonUser.execute(dto.anonId);

      if (!resolvedAnon) {
         throw new UserNotFoundError('Invalid anonId');
      }

      const currentUser = await this._userRepository.retriveUserById(resolvedAnon.userId);

      if (!currentUser) {
         throw new UserNotFoundError('Resolved anon->user does not exist');
      }

      return {
         firstName: currentUser.firstName,
         lastName: currentUser.lastName,
         bio: currentUser.bio,
         avatarId: currentUser.avatar,
         coverPhoto: currentUser.coverPhoto,
         createdAt: currentUser.createdAt,
         humaneScore: currentUser.humaneScore
      };
   };
}
