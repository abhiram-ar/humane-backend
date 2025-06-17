import { UpdateUserCoverPhotoInputDTO } from '@dtos/user/updateUserCoverPhoto.input.dto';

export interface IUpdateUserCoverPhoto {
   execute(
      userId: string,
      dto: UpdateUserCoverPhotoInputDTO
   ): Promise<{ updatedCoverPhotoKey: string; newCoverPhotoURL: string | undefined }>;
}
