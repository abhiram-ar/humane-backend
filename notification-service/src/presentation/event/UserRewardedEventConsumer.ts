import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { io } from '@presentation/websocket/ws';
import { isUserOnline } from '@presentation/websocket/utils/isUserOnline';
import { userRewardedSchema } from '@application/dtos/userRewarded.dto';

export class UserRewardedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(private readonly _kafka: KafkaSingleton) {
      this.consumer = this._kafka.createConsumer('notification-srv-user-rewarded-v5');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('user rewarded event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.REWARD_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.USER_REWARDED) {
                  throw new EventConsumerMissMatchError();
               }

               const {
                  data: validatedDTO,
                  error,
                  success,
               } = userRewardedSchema.safeParse(event.payload);
               if (!success) {
                  throw new ZodValidationError(error);
               }

               if (await isUserOnline(event.payload.userId)) {
                  io.to(validatedDTO.userId).emit(
                     'user-rewarded',
                     validatedDTO.amount,
                     event.timestamp
                  );
               }

               logger.info(`processed-> ${event.eventType} ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventType} ${event.eventId}`, { error: e });
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
