import { FriendshipError } from '@application/errors/FriendshipError';
import { RelationshipBlockedError } from '@application/errors/RelationshipBlockedError';
import { Friendship } from '@domain/entities/friendship.entity';
import { SendFriendRequestInputDTO } from '@dtos/friendship/addFriendInput.dto';
import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IUserRepository } from '@ports/IUserRepository';
import { UserBlockedError, UserNotFoundError } from 'humane-common';

export class SendFriendRequest {
   constructor(
      private readonly _friendShipRepository: IFriendshipRepository,
      private readonly _blockedRelationshipRepository: IBlockedRelationshipRepository,
      private readonly _userRepository: IUserRepository
   ) {}

   execute = async (dto: SendFriendRequestInputDTO) => {
      // todo: optimize DB call. Consolidate into one if possible

      const recipient = await this._userRepository.getUserStatusById(dto.recieverId);

      if (!recipient) {
         throw new UserNotFoundError('Invalid reciverId');
      }
      if (recipient.isBlocked) {
         throw new UserBlockedError('cannot send friendrequest to a blocked user');
      }

      const isBlocked = await this._blockedRelationshipRepository.isBlockedBy(
         dto.requesterId,
         dto.recieverId
      );

      if (isBlocked) {
         throw new RelationshipBlockedError(
            'Recipient user has blocked you. Cannot send friend request'
         );
      }

      const existingFriendship = await this._friendShipRepository.retriveFriendship(
         ...Friendship.sortUserId(dto.recieverId, dto.requesterId)
      );

      if (existingFriendship) {
         if (existingFriendship.status === 'ACCEPTED') {
            throw new FriendshipError('Cannot send friend request to existing friend');
         }
         if (existingFriendship.status === 'PENDING')
            throw new FriendshipError('friendrequest alreay send. Cannot request');
      }

      const newFriendship = new Friendship(dto.recieverId, dto.requesterId, 'PENDING');
      const newFriendRequest = await this._friendShipRepository.addFriendRequest(
         newFriendship,
         dto.requesterId,
         dto.recieverId
      );

      // todo: throw the event to event bus

      return { receiverId: newFriendRequest.receiverId, status: newFriendRequest.status };
   };
}
