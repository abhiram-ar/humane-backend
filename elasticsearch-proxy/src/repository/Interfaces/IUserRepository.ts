import { UpdateUserDTO } from '@dtos/updateUser.dto';
import { CreateUserDTO } from 'dto/createUser.dto';

export interface IUserRepository {
   createCommand(dto: CreateUserDTO): Promise<void>;

   updatedAtQuery(id: string): Promise<{ updatedAt: string | undefined } | null>;

   updateCommand(updatedAt: string, dto: UpdateUserDTO): Promise<void>;

   updateUserAvatarKeyCommand(
      updatedAt: string,
      docId: string,
      avatarKey: string | null
   ): Promise<void>;

   updateUserCoverPhotoKeyCommand(
      updatedAt: string,
      docId: string,
      coverPhotoKey: string | null
   ): Promise<void>;

   updateUserBlockStatusCommand(
      updatedAt: string,
      docId: string,
      newBlockStatus: boolean
   ): Promise<void>;
}
