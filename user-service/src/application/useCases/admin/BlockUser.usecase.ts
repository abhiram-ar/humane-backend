import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { AdminGetUserResponseDTO } from '@dtos/admin/getUsers.dto';
import { UpdateUserBlockStatusDTO } from '@dtos/admin/updateUserBlockStatus.dto';
import { IEventPublisher } from '@ports/IEventProducer';
import { IUserRepository } from '@ports/IUserRepository';
import {
   AppEventsTypes,
   createEvent,
   EventBusError,
   MessageBrokerTopics,
   UpdateUserBlockStatusEventPaylaod,
} from 'humane-common';

export class AdminUpdateUserBlockStatus {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (dto: UpdateUserBlockStatusDTO): Promise<AdminGetUserResponseDTO | null> => {
      const user = await this._userRepository.updateBlockStatus(dto.userId, dto.newBlockStatus);

      if (!user) {
         throw new UserNotFoundError('Invalid userID');
      }

      const eventPayload: UpdateUserBlockStatusEventPaylaod = {
         id: user.id,
         isBlocked: user.isBlocked,
      };

      const userAvatarURLUpdatedEvent = createEvent(
         AppEventsTypes.USER_BLOCK_STATUS_UPDATED,
         eventPayload
      );

      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
         userAvatarURLUpdatedEvent
      );
      if (!ack) {
         throw new EventBusError('error while publishing user blocked status updated event');
      }

      return user;
   };
}
