import { logger } from '@config/logger';
import { createUserSchema } from '@dtos/createUser.dto';
import { updateUserSchema } from '@dtos/updateUser.dto';
import { updateUserAvatarKeySchema } from '@dtos/updateUserAvatarKey.dto';
import { updateUserBlockStatusSchema } from '@dtos/updateUserBlockStatus.dto';
import { updateUserCoverPhotokeySchema } from '@dtos/updateUserCoverPhotokey';
import { UserServices } from '@services/user.services';
import { AppEvent, AppEventsTypes, KafkaTopics } from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';

export class UserProfileEventsConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _userServices: UserServices
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-22');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('User profile event consumer connected ');

      await this.consumer.subscribe({
         topic: KafkaTopics.USER_PROFILE_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            const tempTraceId = `${event.eventType}-${event.eventId.split('-')[0]}`;
            logger.debug(`new Event-> ${tempTraceId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType === AppEventsTypes.USER_CREATED) {
                  const parsed = createUserSchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new Error('Invalid event payload');
                  }

                  await this._userServices.create(parsed.data);
               } else if (event.eventType === AppEventsTypes.USER_UPDATED) {
                  const parsed = updateUserSchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new Error('Invalid event payload');
                  }
                  await this._userServices.update(event.timestamp, parsed.data);
               } else if (event.eventType === AppEventsTypes.USER_AVATAR_UPDATED) {
                  const parsed = updateUserAvatarKeySchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new Error('Invalid event payload');
                  }

                  await this._userServices.updateUserAvatarKey(event.timestamp, parsed.data);
               } else if (event.eventType === AppEventsTypes.USER_COVER_PHOTO_UPDATED) {
                  const parsed = updateUserCoverPhotokeySchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new Error('Invalid event payload');
                  }

                  this._userServices.updateUserCoverPhotoKey(event.timestamp, parsed.data);
               } else if (event.eventType === AppEventsTypes.USER_BLOCK_STATUS_UPDATED) {
                  const parsed = updateUserBlockStatusSchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new Error('Invalid event payload');
                  }
                  this._userServices.updateBlockStatus(event.timestamp, parsed.data);
               } else {
                  throw new Error('Event not configured for this consumer');
               }

               logger.info(`processed-> ${tempTraceId}`);
            } catch (e) {
               logger.error(`error processing: ${tempTraceId}`);
               logger.error((e as Error).message);
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
