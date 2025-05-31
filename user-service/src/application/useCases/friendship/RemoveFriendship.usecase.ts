import { EventBusError } from '@application/errors/EventbusError';
import { FriendshipError } from '@application/errors/FriendshipError';
import { GenericError } from '@application/errors/GenericError';
import { RelationshipStatus } from '@application/types/RelationshipStatus';
import { Friendship } from '@domain/entities/friendship.entity';
import { RemoveFriendshipInputDTO } from '@dtos/friendship/RemoveFriendshipInput.dto';
import { IEventPublisher } from '@ports/IEventProducer';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import { IUserRepository } from '@ports/IUserRepository';
import { AppEventsTypes, createEvent, KafkaTopics, UserNotFoundError } from 'humane-common';

export class RemoveFriendship {
   constructor(
      private readonly _friendshipRepo: IFriendshipRepository,
      private readonly _userRepo: IUserRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (
      dto: RemoveFriendshipInputDTO
   ): Promise<{ targetUserId: string; status: RelationshipStatus }> => {
      const targetUser = await this._userRepo.getUserStatusById(dto.targetUserId);
      if (!targetUser) {
         throw new UserNotFoundError('Invalid/NonExistant targetUserId');
      }

      const friendShip = await this._friendshipRepo.retriveFriendship(
         ...Friendship.sortUserId(dto.currenUserId, dto.targetUserId)
      );

      if (!friendShip) {
         throw new FriendshipError('friendship does not exist to remove');
      }

      const deletedFriendship = await this._friendshipRepo.deleteFriendship(friendShip);
      if (!deletedFriendship) {
         throw new GenericError('Unable to cancel friend requset');
      }

      // TODO:emit cancelled event
      const friendshipDeletedEvent = createEvent(
         AppEventsTypes.FRIENDSHIP_DELETED,
         deletedFriendship
      );
      const { ack } = await this._eventPublisher.send(
         KafkaTopics.FRIENDSHIP_EVENTS_TOPIC,
         friendshipDeletedEvent
      );
      if (!ack) {
         throw new EventBusError('error while publishing friendship deleted event');
      }

      return { targetUserId: targetUser.id, status: 'strangers' };
   };
}
