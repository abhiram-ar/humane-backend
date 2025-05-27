import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import {
   MutualFriendsCountInputDTO,
   MutualFriendsListInputDTO,
   MutualFriendsListOutputDTO,
} from '@dtos/friendship/MutualFriends.dto';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IStorageService } from '@ports/IStorageService';
import { IUserRepository } from '@ports/IUserRepository';

export class MutualFriends {
   constructor(
      private readonly _userRepo: IUserRepository,
      private readonly _friendshipRepo: IFriendshipRepository,
      protected readonly _storageService: IStorageService
   ) {}

   list = async (dto: MutualFriendsListInputDTO): Promise<MutualFriendsListOutputDTO> => {
      const targetUser = await this._userRepo.getUserStatusById(dto.targetUserId);

      if (!targetUser) {
         throw new UserNotFoundError('Target user does not exist');
      }
      if (targetUser.isBlocked) {
         throw new UserBlockedError('Taget user is blocked by the platform');
      }

      const result = await this._friendshipRepo.findMutualFriends(
         dto.currentUserId,
         dto.targetUserId,
         dto.from,
         dto.size
      );

      // TODO: DRY
      const urlHydratedFriendReqList = result.mutualUsers.map((user) => {
         const { avatar, ...data } = user;
         let avatarURL: string | null = null;
         if (user.avatar) {
            avatarURL = this._storageService.getPublicCDNURL(user.avatar);
         }
         return { ...data, avatarURL };
      });

      return { mutualFriends: urlHydratedFriendReqList, from: result.from };
   };

   count = async (dto: MutualFriendsCountInputDTO): Promise<number> => {
      const targetUser = await this._userRepo.getUserStatusById(dto.targetUserId);

      if (!targetUser) {
         throw new UserNotFoundError('Target user does not exist');
      }
      if (targetUser.isBlocked) {
         throw new UserBlockedError('Taget user is blocked by the platform');
      }

      const count = await this._friendshipRepo.countMutualFriends(
         dto.currentUserId,
         dto.targetUserId
      );

      return count;
   };
}
