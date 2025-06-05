import { IUserRepository } from '@ports/IUserRepository';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UpdateUserCoverPhotoInputDTO } from '@dtos/user/updateUserCoverPhoto.input.dto';
import { IStorageService } from '@ports/IStorageService';
import {
   AppEventsTypes,
   createEvent,
   EventBusError,
   MessageBrokerTopics,
   UpdateUserCoverPhotoKeyEventPayload,
} from 'humane-common';
import { IEventPublisher } from '@ports/IEventProducer';

export class UpdateUserCoverPhoto {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _storageService: IStorageService,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (
      userId: string,
      dto: UpdateUserCoverPhotoInputDTO
   ): Promise<{ updatedCoverPhotoKey: string; newCoverPhotoURL: string | undefined }> => {
      const update = await this._userRepository.updateCoverPhoto(userId, dto.newCoverPhotoKey);

      if (!update) {
         throw new UserNotFoundError('unable to update avatar of resolved anon');
      }

      // if the client remove the avatar photo be setting newAvatarKey as "",
      // we dont want to generete a CND link for a invalid key
      let newCoverPhotoURL: string | undefined;
      if (update.updatedCoverPhotoKey) {
         newCoverPhotoURL = this._storageService.getPublicCDNURL(update.updatedCoverPhotoKey);
      }

      const eventPayload: UpdateUserCoverPhotoKeyEventPayload = {
         id: userId,
         coverPhotoKey: update.updatedCoverPhotoKey || null,
      };
      const userCoverPhotoKeyUpdatedEvent = createEvent(
         AppEventsTypes.USER_COVER_PHOTO_UPDATED,
         eventPayload
      );

      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
         userCoverPhotoKeyUpdatedEvent
      );
      if (!ack) {
         throw new EventBusError('error while publishing user avatar updated event');
      }

      return { updatedCoverPhotoKey: update.updatedCoverPhotoKey, newCoverPhotoURL };
   };
}
