import { IUserRepository } from '@ports/IUserRepository';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateUserAvatarInputDTO } from '@dtos/user/updateAnonProfileAvatar.input.dto';
import { IStorageService } from '@ports/IStorageService';
import { IEventPublisher } from '@ports/IEventProducer';
import {
   AppEventsTypes,
   createEvent,
   EventBusError,
   MessageBrokerTopics,
   UpdateUserAvatarKeyEventPayload,
} from 'humane-common';

export class UpdateUserAvatar {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (
      userId: string,
      dto: UpdateUserAvatarInputDTO
   ): Promise<{ updatedAvatarKey: string; newAvatarURL: string | undefined }> => {
      const update = await this._userRepository.updateAvatar(userId, dto.newAvatarKey);

      if (!update) {
         throw new UserNotFoundError('unable to update avatar of  user');
      }

      // if the client remove the avatar photo be setting newAvatarKey as "",
      // we dont want to generete a CND link for a invalid key

      let newAvatarURL: string | undefined;
      if (update.updatedAvatarKey) {
         newAvatarURL = this._storageService.getPublicCDNURL(update.updatedAvatarKey);
      }

      const eventPayload: UpdateUserAvatarKeyEventPayload = {
         id: userId,
         avatarKey: update.updatedAvatarKey || null,
      };
      const userAvatarURLUpdatedEvent = createEvent(
         AppEventsTypes.USER_AVATAR_UPDATED,
         eventPayload
      );

      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
         userAvatarURLUpdatedEvent
      );
      if (!ack) {
         throw new EventBusError('error while publishing user avatar updated event');
      }

      return { updatedAvatarKey: update.updatedAvatarKey, newAvatarURL };
   };
}
