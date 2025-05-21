import { UpdateNameAndBioDTO } from '@dtos/updateUserNameBio.dto';
import { CreateUserDTO } from 'dto/createUser.dto';

export interface IUserRepository {
   createCommand(dto: CreateUserDTO): Promise<void>;

   updatedAtQuery(id: string): Promise<{ updatedAt: string | undefined } | null>;

   updateNameAndBioCommand(updatedAt: string, dto: UpdateNameAndBioDTO): Promise<void>;
   
   updateUserAvatarKeyCommand(updatedAt: string, docId: string, avatarKey: string | null): Promise<void>;
   
   updateUserCoverPhotoKeyCommand(updatedAt: string, docId: string, coverPhotoKey: string | null): Promise<void>;
}
