import { UpdateUserProfileInputDTO } from '@application/DTO-mapper/user/updateUserProfile.input.dto';

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
