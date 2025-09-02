import { UpdateUserAvatarInputDTO } from '@application/DTO-mapper/user/updateAnonProfileAvatar.input.dto';

export interface IUpdateUserAvatar {
   execute(
      userId: string,
      dto: UpdateUserAvatarInputDTO
   ): Promise<{ updatedAvatarKey: string; newAvatarURL: string | undefined }>;
}
