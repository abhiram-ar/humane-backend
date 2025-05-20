import { IUserRepository } from '@ports/IUserRepository';
import { UpdateUserProfileInputDTO } from '@dtos/user/updateUserProfile.input.dto';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import {
   AppEventsTypes,
   createEvent,
   KafkaTopics,
   UserNameBioUpdatedEventPayload,
} from 'humane-common';
import { IEventPublisher } from '@ports/IEventProducer';
import { EventBusError } from '@application/errors/EventbusError';

export class UpdateUserProfile {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (
      userId: string,
      dto: UpdateUserProfileInputDTO
   ): Promise<{
      firstName: string;
      lastName: string;
      bio: string;
   }> => {
      const updatedUserProfile = await this._userRepository.updateNameAndBio(
         userId,
         dto.firstName,
         dto.lastName,
         dto.bio
      );

      if (!updatedUserProfile) {
         throw new UserNotFoundError('user does not exist');
      }

      const eventPayload: UserNameBioUpdatedEventPayload = {
         id: updatedUserProfile.id,
         firstName: updatedUserProfile.firstName,
         lastName: updatedUserProfile.lastName || '',
         bio: updatedUserProfile.bio || '',
         createdAt: new Date().toISOString(),
      };

      //
      const userNameBioUpdatedEvent = createEvent(
         AppEventsTypes.USER_NAME_BIO_UPDATED,
         eventPayload
      );

      const { ack } = await this._eventPublisher.send(
         KafkaTopics.USER_PROFILE_EVENTS_TOPIC,
         userNameBioUpdatedEvent
      );

      if (!ack) {
         throw new EventBusError('Unable to send user name/bio update event');
      }

      return {
         firstName: updatedUserProfile.firstName,
         lastName: updatedUserProfile.lastName || '',
         bio: updatedUserProfile.bio || '',
      };
   };
}
