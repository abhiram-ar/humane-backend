import { GetCurrentAnonProfileInputDTO } from '@dtos/user/getCurrentAnonProfile.input.dto';

export interface IGetCurrentUserProfile {
   execute(dto: GetCurrentAnonProfileInputDTO): Promise<{
      firstName: string;
      lastName?: string;
      bio?: string;
      avatarURL?: string;
      coverPhotoURL?: string;
      createdAt: string;
      humaneScore: number;
   }>;
}
