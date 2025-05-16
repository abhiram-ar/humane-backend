import { IUserRepository } from '@ports/IUserRepository';
import { UpdateUserProfileInputDTO } from '@dtos/user/updateUserProfile.input.dto';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';

export class UpdateUserProfile {
   constructor(private readonly _userRepository: IUserRepository) {}

   execute = async (
      userId: string,
      dto: UpdateUserProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName: string;
      bio: string;
   }> => {
      const updatedUserProfile = await this._userRepository.updateNameAndBio(
         userId,
         dto.firstName,
         dto.lastName,
         dto.bio
      );

      if (!updatedUserProfile) {
         throw new UserNotFoundError('user does not exist');
      }

      return {
         firstName: updatedUserProfile.firstName,
         lastName: updatedUserProfile.lastName || '',
         bio: updatedUserProfile.bio || '',
      };
   };
}
