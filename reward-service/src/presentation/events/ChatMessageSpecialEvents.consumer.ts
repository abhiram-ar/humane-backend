import { issueChatRepliedWithinResonableTimeInputSchema } from '@application/dto/IssueChatRepliedWithinResonableTimeReward.dto,';
import { logger } from '@config/logger';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IIssueChatRepliedWithinResonableTimeReward } from '@ports/usecases/reward/IIssueChatRepliedWithinResonableTime,usecase';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class ChatMessagesSpecialEventsConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _issueChatRepliedInResonableTime: IIssueChatRepliedWithinResonableTimeReward
   ) {
      this.consumer = this._kafka.createConsumer('reward-service-chat-messages-special-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('chat-messages special events consumer connected');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.MESSAGE_SPECAIAL_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.FIRST_REPLY_WITHIN_24_HR) {
                  throw new EventConsumerMissMatchError();
               }

               const validatedDTO = issueChatRepliedWithinResonableTimeInputSchema.safeParse(
                  event.payload
               );
               if (!validatedDTO.success) {
                  throw new ZodValidationError(validatedDTO.error);
               }

               await this._issueChatRepliedInResonableTime.execute(validatedDTO.data);

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
