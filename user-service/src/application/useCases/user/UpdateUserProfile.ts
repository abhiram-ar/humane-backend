import { IUserRepository } from '@ports/IUserRepository';
import { UpdateUserProfileInputDTO } from '@dtos/user/updateUserProfile.input.dto';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserUpdatedEventPayload,
} from 'humane-common';
import { IEventPublisher } from '@ports/IEventProducer';
import { EventBusError } from '@application/errors/EventbusError';
import { IUpdateUserProfile } from '@ports/usecases/user/IUpdateUserProfile';

export class UpdateUserProfile implements IUpdateUserProfile {
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

      const eventPayload: UserUpdatedEventPayload = {
         id: updatedUserProfile.id,
         firstName: updatedUserProfile.firstName,
         lastName: updatedUserProfile.lastName || null,
         bio: updatedUserProfile.bio || null,
         avatarKey: updatedUserProfile.avatar || null,
         coverPhotoKey: updatedUserProfile.coverPhoto || null,
         createdAt: updatedUserProfile.createdAt,
         lastLoginTime: updatedUserProfile.lastLoginTime || null,
         isBlocked: updatedUserProfile.isBlocked,
         isHotUser: updatedUserProfile.isHotUser,
         humaneScore: updatedUserProfile.humaneScore,
      };

      //
      const userNameBioUpdatedEvent = createEvent(AppEventsTypes.USER_UPDATED, eventPayload);
      console.log(AppEventsTypes);
      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
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
