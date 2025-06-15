import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestCountInputDTO,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';
import { IGetFriendRequest } from '@ports/usecases/friendship/IGetFriendRequestList.usercase';

export class GetFriendRequest implements IGetFriendRequest {
   constructor(
      private readonly _friendshipRepo: IFriendshipRepository,
      private readonly _storageService: IStorageService
   ) {}

   list = async (
      dto: GetFriendRequestListInputDTO
   ): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }> => {
      const res = await this._friendshipRepo.getUserFriendRequestList(
         dto.userId,
         dto.from,
         dto.size
      );

      const urlHydratedFriendReqList: FriendRequestList = res.friendReqs.map((user) => {
         const { avatarKey, status, ...data } = user;
         let avatarURL: string | null = null;
         if (user.avatarKey) {
            avatarURL = this._storageService.getPublicCDNURL(user.avatarKey);
         }
         const outputStatus: RelationshipStatus =
            status === 'PENDING' ? 'friendReqWaitingApproval' : 'friends';
         return { ...data, status: outputStatus, avatarURL };
      });

      return { friendReqs: urlHydratedFriendReqList, from: res.from };
   };

   count = async (dto: GetFriendRequestCountInputDTO): Promise<number> => {
      return this._friendshipRepo.getUserFriendRequsetCount(dto.userId);
   };
}
