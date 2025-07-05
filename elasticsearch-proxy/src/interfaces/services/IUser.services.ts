import {
   InfiniteScrollSearchDTO,
   InfiniteScrollSearchOutputDTO,
} from 'interfaces/dto/infiniteScrollSearch.dto';
import { PaginatedSearchDTO } from 'interfaces/dto/paginatedSearch.dto';
import { PrivillegedUserSearchOutputDTO } from 'interfaces/dto/privillegedSearch.output.dto';
import { UpdateUserDTO } from 'interfaces/dto/updateUser.dto';
import { UpdateUserAvatarKeyDTO } from 'interfaces/dto/updateUserAvatarKey.dto';
import { UpdaeteUserBlockStautsDTO } from 'interfaces/dto/updateUserBlockStatus.dto';
import { UpdateUserCoverPhotoKeyDTO } from 'interfaces/dto/updateUserCoverPhotokey';
import { CreateUserDTO } from 'interfaces/dto/createUser.dto';
import { GetUserProfileOutputDTO } from 'interfaces/dto/GetUserProfile.dto';
import {
   GetBasicUserProfileFromIdsOutputDTO,
   GetUserBasicProfileFromIdsInputDTO,
} from 'interfaces/dto/GetUserBasicProfileFromIDs';

export interface IUserServices {
   createProfile(dto: CreateUserDTO): Promise<void>;

   upsertProfile(eventTimeStamp: string, dto: UpdateUserDTO): Promise<void>;

   updateUserAvatarKey(eventTimestamp: string, dto: UpdateUserAvatarKeyDTO): Promise<void>;

   updateUserCoverPhotoKey(eventTimestamp: string, dto: UpdateUserCoverPhotoKeyDTO): Promise<void>;

   updateBlockStatus(eventTimestamp: string, dto: UpdaeteUserBlockStautsDTO): Promise<void>;

   paginatedSearch(dto: PaginatedSearchDTO): Promise<PrivillegedUserSearchOutputDTO>;
   infiniteScollSearch(dto: InfiniteScrollSearchDTO): Promise<InfiniteScrollSearchOutputDTO>;

   getUserProfile(userId: string): Promise<GetUserProfileOutputDTO>;

   getBasicUserProfile(
      dto: GetUserBasicProfileFromIdsInputDTO
   ): Promise<GetBasicUserProfileFromIdsOutputDTO>;
}
