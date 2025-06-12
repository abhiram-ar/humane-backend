import { logger } from '@config/logger';
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
import { IUserRepository } from '@repository/elasticsearch/user repository/IUserRepository';
import { IPagination } from 'Types/Pagination.type';
import { CDNService } from './CDN.services';
import { UserNotFoundError } from 'humane-common';
import { GetUserProfileOutputDTO } from 'interfaces/dto/GetUserProfile.dto';
import {
   GetBasicUserProfileFromIdsOutputDTO,
   GetUserBasicProfileFromIdsInputDTO,
} from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { IUserServices } from 'interfaces/services/IUser.services';

export class UserServices implements IUserServices {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _cdnService: CDNService
   ) {}

   create = async (dto: CreateUserDTO): Promise<void> => {
      await this._userRepository.createCommand(dto);
   };

   update = async (eventTimeStamp: string, dto: UpdateUserDTO) => {
      const incomingTimestamp = new Date(eventTimeStamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         await this.create(dto);
         return;
      }

      const currnentTimeStamp = new Date(res.updatedAt ?? 0); // in case updateAT does not exist

      if (incomingTimestamp > currnentTimeStamp) {
         this._userRepository.updateCommand(eventTimeStamp, dto);
      } else {
         logger.warn('Skipping user update. Reason: old event');
      }
   };

   updateUserAvatarKey = async (eventTimestamp: string, dto: UpdateUserAvatarKeyDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserAvatarKeyCommand(eventTimestamp, dto.id, dto.avatarKey);
      } else {
         logger.warn('Skipping avatarKey update. Reason: old event');
      }
   };

   updateUserCoverPhotoKey = async (eventTimestamp: string, dto: UpdateUserCoverPhotoKeyDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserCoverPhotoKeyCommand(
            eventTimestamp,
            dto.id,
            dto.coverPhotoKey
         );
      } else {
         logger.warn('Skipping coverPhotoKey update. Reason: old event');
      }
   };

   updateBlockStatus = async (eventTimestamp: string, dto: UpdaeteUserBlockStautsDTO) => {
      const incommingTimestamp = new Date(eventTimestamp);

      const res = await this._userRepository.updatedAtQuery(dto.id);
      if (!res) {
         throw new Error('user doc does not exist to update');
      }
      const currnentTimeStamp = new Date(res.updatedAt ?? 0);
      if (incommingTimestamp > currnentTimeStamp) {
         this._userRepository.updateUserBlockStatusCommand(eventTimestamp, dto.id, dto.isBlocked);
      } else {
         logger.warn('Skipping blockstatus update. Reason: old event');
      }
   };

   paginatedSearch = async (dto: PaginatedSearchDTO): Promise<PrivillegedUserSearchOutputDTO> => {
      const from = (dto.page - 1) * dto.limit;

      const { users, totalEntries } = await this._userRepository.paginatedSearchQuery(
         dto.search,
         from,
         dto.limit
      );

      const totalPages = Math.ceil(totalEntries / dto.limit) || 1;

      const pagination: IPagination = {
         page: dto.page,
         limit: dto.limit,
         totalItems: totalEntries,
         totalPages,
      };

      const parsedUser = users.map((user) => ({
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName,
      }));

      return { users: parsedUser, pagination };
   };

   infiniteScollSearch = async (
      dto: InfiniteScrollSearchDTO
   ): Promise<InfiniteScrollSearchOutputDTO> => {
      const res = await this._userRepository.infiniteScrollSearchQuery(
         dto.searchQuery,
         dto.searchAfter,
         dto.limit
      );

      const sanitizedAndURLHydratedUserlist = res.users.map((user) => ({
         id: user.id,
         firstName: user.firstName,
         lastName: user.lastName ?? null,
         avatarURL: user.avatarKey ? this._cdnService.getPublicCDNURL(user.avatarKey) : null,
      }));

      return {
         users: sanitizedAndURLHydratedUserlist,
         scroll: { hasMore: res.hasMore, cursor: res.searchAfter ? res.searchAfter[0] : null },
      };
   };

   getUserProfile = async (userId: string): Promise<GetUserProfileOutputDTO> => {
      const userDoc = await this._userRepository.getUserById(userId);

      if (!userDoc) {
         throw new UserNotFoundError('User does not exists in read model');
      }

      let avatarURL: string | undefined;
      if (userDoc.avatarKey) {
         avatarURL = this._cdnService.getPublicCDNURL(userDoc.avatarKey);
      }

      let coverPhotoURL: string | undefined;
      if (userDoc.coverPhotoKey) {
         coverPhotoURL = this._cdnService.getPublicCDNURL(userDoc.coverPhotoKey);
      }

      return {
         id: userDoc.id,
         firstName: userDoc.firstName,
         lastName: userDoc.lastName,
         bio: userDoc.bio,
         createdAt: userDoc.createdAt,
         avatarURL,
         coverPhotoURL,
      };
   };

   getBasicUserProfile = async (
      dto: GetUserBasicProfileFromIdsInputDTO
   ): Promise<GetBasicUserProfileFromIdsOutputDTO> => {
      const userDoclist = await this._userRepository.getUsersById(dto);

      const avatarURLHydratedUserList = userDoclist.map((userDoc) => {
         if (!userDoc) {
            return null;
         }

         let avatarURL: string | undefined;
         if (userDoc.avatarKey) {
            avatarURL = this._cdnService.getPublicCDNURL(userDoc.avatarKey);
         }

         return {
            id: userDoc.id,
            firstName: userDoc.firstName,
            lastName: userDoc.lastName,
            avatarURL: avatarURL,
         };
      });

      return avatarURLHydratedUserList;
   };
}
