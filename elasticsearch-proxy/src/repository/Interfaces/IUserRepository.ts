import { UpdateUserDTO } from '@dtos/updateUser.dto';
import { UserDocument } from '@repository/elasticsearch/UserDocument.type';
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

   paginatedSearchQuery(
      search: string,
      from: number,
      size: number
   ): Promise<{ users: (UserDocument & { id: string })[]; totalEntries: number }>;

   infiniteScrollSearchQuery(
      searchQuery: string,
      sortAfter: [number] | null,
      size: number
   ): Promise<{
      users: (UserDocument & { id: string })[];
      searchAfter: [number] | null;
      hasMore: boolean;
   }>;

   getUserById(userId: string): Promise<(UserDocument & { id: string }) | null>;

   getUsersById(userIds: string[]): Promise<((UserDocument & { id: string }) | null)[]>;
}
