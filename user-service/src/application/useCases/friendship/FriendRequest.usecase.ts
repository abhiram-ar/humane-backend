import { FriendshipError } from '@application/errors/FriendshipError';
import { GenericError } from '@application/errors/GenericError';
import { RelationshipBlockedError } from '@application/errors/RelationshipBlockedError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { Friendship } from '@domain/entities/friendship.entity';
import { AcceptFriendshipInputDTO } from '@dtos/friendship/AcceptFriendRequset.dto';
import { cancelFriendRequestInputDTO } from '@dtos/friendship/cancelFriendRequestInput.dto';
import { SendFriendRequestInputDTO } from '@dtos/friendship/SendFriendRequestInput.dto';
import { IBlockedRelationshipRepository } from '@ports/IBlockedRelationshipRepository';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IUserRepository } from '@ports/IUserRepository';

export class FriendRequest {
   constructor(
      private readonly _friendShipRepository: IFriendshipRepository,
      private readonly _blockedRelationshipRepository: IBlockedRelationshipRepository,
      private readonly _userRepository: IUserRepository
   ) {}

   send = async (
      dto: SendFriendRequestInputDTO
   ): Promise<{ receiverId: string; status: RelationshipStatus }> => {
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

      // TODO: throw the event to event bus

      return { receiverId: newFriendRequest.receiverId, status: 'friendreqSend' };
   };

   accept = async (
      dto: AcceptFriendshipInputDTO
   ): Promise<{ requesterId: string; status: RelationshipStatus }> => {
      //make sure rerqusterId exists
      const requestedUser = await this._userRepository.getUserStatusById(dto.requesterId);
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

      const friendship = await this._friendShipRepository.retriveFriendship(
         ...Friendship.sortUserId(dto.userId, dto.requesterId)
      );

      if (!friendship) throw new FriendshipError('Friend request does not exist (anymore)');

      if (friendship.status === 'ACCEPTED') {
         throw new FriendshipError('Friend request alreay accepted');
      }

      // accetpt friend request
      friendship.status = 'ACCEPTED';
      const result = await this._friendShipRepository.updateFriendRequest(friendship);

      if (!result) throw new FriendshipError('Cannot update a invalid friendship');

      // TODO: pubblish event

      return { requesterId: result.requesterId, status: 'friends' };
   };

   cancel = async (
      dto: cancelFriendRequestInputDTO
   ): Promise<{ receiverId: string; status: RelationshipStatus }> => {
      const reciver = await this._userRepository.getUserStatusById(dto.recieverId);

      if (!reciver) {
         throw new UserNotFoundError('Invalid recieverId to cancel the friend request');
      }

      const friendShip = await this._friendShipRepository.retriveFriendship(
         ...Friendship.sortUserId(dto.requesterId, dto.recieverId)
      );

      if (!friendShip) {
         throw new FriendshipError('No friend request to cancel');
      }

      if (friendShip.status !== 'PENDING') {
         if (friendShip.status === 'ACCEPTED') {
            throw new FriendshipError('cannot cancel a accepted friend request');
         } else if (friendShip.status === 'DECLINED') {
            throw new FriendshipError('request already decliend by other user');
         }
      }

      const res = await this._friendShipRepository.deleteFriendship(friendShip);
      if (!res) {
         throw new GenericError('Unable to cancel friend requset');
      }

      // TODO:emit cancelled event

      return { receiverId: res.receiverId, status: 'strangers' };
   };
}
