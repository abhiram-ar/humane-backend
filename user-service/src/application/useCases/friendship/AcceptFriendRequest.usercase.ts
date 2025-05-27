import { FriendshipError } from '@application/errors/FriendshipError';
import { RelationshipBlockedError } from '@application/errors/RelationshipBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { Friendship } from '@domain/entities/friendship.entity';
import { AcceptFriendshipInputDTO } from '@dtos/friendship/AcceptFriendRequset.dto';
import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IUserRepository } from '@ports/IUserRepository';

export class AcceptFriendRequest {
   constructor(
      private readonly _userRepo: IUserRepository,
      private readonly _blockedRelationshipRepository: IBlockedRelationshipRepository,
      private readonly _friendshipRepo: IFriendshipRepository
   ) {}
   execute = async (dto: AcceptFriendshipInputDTO) => {
      //make sure rerqusterId exists
      const requestedUser = await this._userRepo.getUserStatusById(dto.requesterId);
      if (!requestedUser) {
         throw new UserNotFoundError('Invalid requesterId to accept friend request');
      }
      if (requestedUser.isBlocked) {
         throw new FriendshipError('Cannot accepet friend request from a plaform blocked user');
      }

      //relationship blocks
      const isBlocked = await this._blockedRelationshipRepository.isBlockedBy(
         dto.userId,
         dto.requesterId
      );

      if (isBlocked) {
         throw new RelationshipBlockedError(
            'requseter has blocked the user. Cannot accept friend request'
         );
      }

      const friendship = await this._friendshipRepo.retriveFriendship(
         ...Friendship.sortUserId(dto.userId, dto.requesterId)
      );

      if (!friendship) throw new FriendshipError('Friend request does not exist (anymore)');

      if (friendship.status === 'ACCEPTED') {
         throw new FriendshipError('Friend request alreay accepted');
      } else if (friendship.status === 'DECLINED') {
         throw new FriendshipError('You already declined this friend request');
      }

      // accetpt friend request
      friendship.status = 'ACCEPTED';
      const result = await this._friendshipRepo.updateFriendRequest(friendship);

      if (!result) throw new FriendshipError('Cannot update a invalid friendship');

      // todo: pubblish event

      return { result: result.requesterId, status: result.status };
   };
}
