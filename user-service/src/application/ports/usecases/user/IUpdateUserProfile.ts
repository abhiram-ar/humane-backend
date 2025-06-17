import { UpdateUserProfileInputDTO } from '@dtos/user/updateUserProfile.input.dto';

export interface IUpdateUserProfile {
   execute(
      userId: string,
      dto: UpdateUserProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName: string;
      bio: string;
   }>;
}
