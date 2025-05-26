import { FriendshipError } from '@application/errors/FriendshipError';
import { RelationshipBlockedError } from '@application/errors/RelationshipBlockedError';
import { Friendship } from '@domain/entities/friendship.entity';
import { SendFriendRequestInputDTO } from '@dtos/friendship/addFriendInput.dto';
import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';

export class SendFriendRequest {
   constructor(
      private readonly _friendShipRepository: IFriendshipRepository,
      private _blockedRelationshipRepository: IBlockedRelationshipRepository
   ) {}

   execute = async (dto: SendFriendRequestInputDTO) => {
      
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
         dto.requesterId,
         dto.recieverId
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

      return { receiverId: newFriendRequest.recieverId, status: newFriendRequest.status };
   };
}
