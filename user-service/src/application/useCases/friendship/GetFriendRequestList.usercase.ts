import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import {
   FriendRequestList,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';

export class GetFriendRequestList {
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
      const res = await this._friendshipRepo.getUserFriendRequestList(
         dto.userId,
         dto.from,
         dto.size
      );

      const urlHydratedFriendReqList = res.friendReqs.map((user) => {
         const { avatar, ...data } = user;
         let avatarURL: string | null = null;
         if (user.avatar) {
            avatarURL = this._storageService.getPublicCDNURL(user.avatar);
         }
         return { ...data, avatarURL };
      });

      return { friendReqs: urlHydratedFriendReqList, from: res.from };
   };
}
