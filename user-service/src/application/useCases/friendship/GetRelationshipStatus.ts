import { GenericError } from '@application/errors/GenericError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { Friendship } from '@domain/entities/friendship.entity';
import {
   GetRelationShipStatusInputDTO,
   GetRelationShipStatusOutputDTO,
} from '@dtos/friendship/GetRelationshipStatus.dto';
import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IUserRepository } from '@ports/IUserRepository';

export class GetRelationShipStatus {
   constructor(
      private readonly _userRepo: IUserRepository,
      private readonly _blockedRelatioshipRepo: IBlockedRelationshipRepository,
      private readonly _friendshipRepo: IFriendshipRepository
   ) {}

   execute = async (
      dto: GetRelationShipStatusInputDTO
   ): Promise<GetRelationShipStatusOutputDTO> => {
      // check target user exists
      const targetUser = await this._userRepo.getUserStatusById(dto.tartgetUserId);

      if (!targetUser) {
         throw new UserNotFoundError('Target user does not exist');
      }
      if (targetUser.isBlocked) {
         throw new UserBlockedError('Taget user is blocked by the platform');
      }

      // check if a user bloced the other
      const isCurrentUserBlokedByTargetUser = await this._blockedRelatioshipRepo.isBlockedBy(
         dto.currentUserId,
         dto.tartgetUserId
      );

      if (isCurrentUserBlokedByTargetUser) {
         return 'blocked';
      }

      // check friendship exits
      const friendship = await this._friendshipRepo.retriveFriendship(
         ...Friendship.sortUserId(dto.currentUserId, dto.tartgetUserId)
      );

      if (!friendship) {
         return 'strangers';
      }

      if (friendship.status === 'ACCEPTED') {
         return 'friends';
      }

      // if pending, who send whom
      if (friendship.status === 'PENDING') {
         if (friendship.requesterId === dto.currentUserId) return 'friendreqSend';
         else if (friendship.receiverId === dto.currentUserId) return 'friendReqWaitingApproval';
      }
      // if none of the case matchs. there could be a potentail error
      throw new GenericError('Invalid relationsip state');
   };
}
