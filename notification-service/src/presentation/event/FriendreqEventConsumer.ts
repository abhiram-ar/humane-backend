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

            const dto = {
               friendship: event.payload,
               eventCreatedAt: event.timestamp,
            } as FriendReqNotificationInputDTO;
            try {
               const parsed = friendReqNotificationInputSchema.safeParse(dto);
               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               if (event.eventType === AppEventsTypes.FRIEND_REQ_SENT) {
                  await this._friendReqNotificationService.create(parsed.data);
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_ACCEPTED) {
                  await this._friendReqNotificationService.updateFriendReqStatus(parsed.data);
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_CANCELLED) {
                  await this._friendReqNotificationService.delete(parsed.data);
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_DECLIED) {
                  await this._friendReqNotificationService.updateFriendReqStatus(parsed.data);
               } else if (event.eventType === AppEventsTypes.FRIENDSHIP_DELETED) {
                  // note: we dont want to dete the notification in the repositroy. if two people have been infriended
                  logger.warn('Skipping frindship Deleted event. Its better to keep this record');
               } else {
                  throw new Error(
                     `Invalid event type (${event.eventType}) for notificaion-srv:frendreqNoti consumer`
                  );
               }
               logger.info(`Processed ${event.eventType}: ${event.eventId}`);
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
