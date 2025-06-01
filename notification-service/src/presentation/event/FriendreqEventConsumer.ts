import { Consumer } from 'kafkajs';
import { AppEvent, AppEventsTypes, MessageBrokerTopics, ZodValidationError } from 'humane-common';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { logger } from '@config/logger';
import {
   FriendReqNotificationInputDTO,
   friendReqNotificationInputSchema,
} from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
export class FriendReqEventConsumer {
   private _consumer: Consumer;
   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _friendReqNotificationService: FriendReqNotificationService
   ) {
      this._consumer = this._kafka.createConsumer('friend-req-event-consumer-7');
   }

   start = async () => {
      await this._consumer.connect();
      logger.info('Friendreq event consumer connected');

      await this._consumer.subscribe({
         topic: MessageBrokerTopics.FRIENDSHIP_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this._consumer.run({
         eachMessage: async ({ message }) => {
            if (!message.value) {
               throw new Error('No body/value for message');
            }
            const event = JSON.parse(message.value.toString()) as AppEvent;
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType === AppEventsTypes.FRIEND_REQ_SENT) {
                  const dto: FriendReqNotificationInputDTO = {
                     friendship: event.payload,
                     eventCreatedAt: event.timestamp,
                  };

                  const parsed = friendReqNotificationInputSchema.safeParse(dto);
                  if (!parsed.success) {
                     throw new ZodValidationError(parsed.error);
                  }

                  await this._friendReqNotificationService.create(parsed.data);
               }
            } catch (error) {
               logger.error(`Error while processing ${event.eventId}`);
               logger.error(error);
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
