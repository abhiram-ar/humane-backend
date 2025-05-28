import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';

export class GetUserSendFriendRequestList {
   constructor(
      private readonly _friendshipRepo: IFriendshipRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      dto: GetFriendRequestListInputDTO
   ): Promise<{
      friendReqs: FriendRequestList;
      from: UserListInfinityScollParams;
   }> => {
      const res = await this._friendshipRepo.getUserSendFriendRequestList(
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
            status === 'PENDING' ? 'friendreqSend' : 'friends';

         return { ...data, status: outputStatus, avatarURL };
      });

      return { friendReqs: urlHydratedFriendReqList, from: res.from };
   };
}
