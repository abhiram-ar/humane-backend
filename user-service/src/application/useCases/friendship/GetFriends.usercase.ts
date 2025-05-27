import {
   GetFriendCountInputDTO,
   GetFriendListInputDTO,
   GetFriendListOutputDTO,
} from '@dtos/friendship/GetFriends.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';

export class GetFriends {
   constructor(
      private readonly _friendshipRepo: IFriendshipRepository,
      private readonly _storageService: IStorageService
   ) {}

   list = async (dto: GetFriendListInputDTO): Promise<GetFriendListOutputDTO> => {
      const res = await this._friendshipRepo.getUserFriendList(dto.userId, dto.from, dto.size);

      const urlHydratedFriendReqList = res.friendReqs.map((user) => {
         const { avatarKey, ...data } = user;
         
         let avatarURL: string | null = null;
         
         if (avatarKey) {
            avatarURL = this._storageService.getPublicCDNURL(avatarKey);
         }
         return { ...data, avatarURL };
      });

      return { friends: urlHydratedFriendReqList, from: res.from };
   };

   count = async (dto: GetFriendCountInputDTO): Promise<number> => {
      return await this._friendshipRepo.getUserFriendCount(dto.userId);
   };
}
