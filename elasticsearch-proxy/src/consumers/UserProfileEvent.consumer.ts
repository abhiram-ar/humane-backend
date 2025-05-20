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

                  if (!parsed.success) throw new Error('Invalid event payload');

                  const { ack } = await this._userServices.create(parsed.data);
                  if (!ack) {
                     throw new Error('Unable to write to query model');
                  }

                  logger.info(`processed-> ${tempTraceId}`);
               }
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
