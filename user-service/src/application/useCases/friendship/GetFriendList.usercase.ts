import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { FriendList, GetFriendListInputDTO } from '@dtos/friendship/GetFriends.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';

export class GetFriendList {
   constructor(
      private readonly _friendshipRepo: IFriendshipRepository,
      private readonly _storageService: IStorageService
   ) {}

   execute = async (
      dto: GetFriendListInputDTO
   ): Promise<{
      friends: FriendList;
      from: UserListInfinityScollParams;
   }> => {
      const res = await this._friendshipRepo.getUserFriendList(dto.userId, dto.from, dto.size);

      const urlHydratedFriendReqList = res.friendReqs.map((user) => {
         const { avatar, ...data } = user;
         let avatarURL: string | null = null;
         if (user.avatar) {
            avatarURL = this._storageService.getPublicCDNURL(user.avatar);
         }
         return { ...data, avatarURL };
      });

      return { friends: urlHydratedFriendReqList, from: res.from };
   };
}
