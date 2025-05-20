import { logger } from '@config/logger';
import { createUserSchema } from '@dtos/createUser.dto';
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
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-9.971');
   }

   start = async () => {
      await this.consumer.connect();
      console.log('User profile event consumer connected ');

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

            try {
               if (event.eventType === AppEventsTypes.USER_CREATED) {
                  const parsed = createUserSchema.safeParse(event.payload);

                  if (!parsed.success) {
                     console.log('');
                     return;
                  }

                  // this._userServices.create(parsed.data);
                  logger.info(`processed-> ${tempTraceId}`);
               }
            } catch (error) {
               logger.error(`error processing: ${tempTraceId}`, error);
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
