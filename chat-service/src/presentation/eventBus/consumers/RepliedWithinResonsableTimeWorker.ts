import {
   RepliedWithin24HrsInputDTO,
   repliedWithin24HrsInputSchema,
} from '@application/dto/RepliedWithin24Hrs.dto';
import { logger } from '@config/logger';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { IRepliedWithin24Hrs } from '@ports/usecases/IRepliedWithin24Hrs.usecase';
import {
   AppEvent,
   AppEventsTypes,
   createEvent,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { FirstReplyWithin24HrEventPayload } from 'humane-common/build/events/chat-service-events';
import { Consumer } from 'kafkajs';

export class RepliedWithinResonableTimeWorker implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _repliedWithIn24hrs: IRepliedWithin24Hrs,
      private readonly _eventPubliser: IEventPublisher
   ) {
      this.consumer = this._kafka.createConsumer('chat-srv-RepliedWithinResonableAmount-worker-v7');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('chat-message event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.MESSAGE_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`new Event-> ${event.eventId}`);
            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType !== AppEventsTypes.NEW_MESSAGE) {
                  throw new EventConsumerMissMatchError();
               }

               const userMessage = event.payload;
               const dto: RepliedWithin24HrsInputDTO = {
                  messageId: userMessage.id,
                  senderId: userMessage.senderId,
                  conversationId: userMessage.conversationId,
                  sendAt: userMessage.sendAt,
               };

               const {
                  data: validatedUserMsg,
                  success,
                  error,
               } = repliedWithin24HrsInputSchema.safeParse(dto);
               if (!success) {
                  throw new ZodValidationError(error);
               }

               

               //check if other message exist in chat other than user within last 24 hr
               const res = await this._repliedWithIn24hrs.execute(validatedUserMsg);
               if (!res) return;

               const firstReplyWithin24HrEvent: FirstReplyWithin24HrEventPayload = {
                  messageId: validatedUserMsg.messageId,
                  senderId: validatedUserMsg.senderId,
                  conversationId: validatedUserMsg.conversationId,
                  sendAt: validatedUserMsg.sendAt,
                  repliedToUserId: res.otherUserLastMsg.senderId,
                  message: validatedUserMsg.message,
               };

               const firstReplyWithin24HrEventPayload = createEvent(
                  AppEventsTypes.FIRST_REPLY_WITHIN_24_HR,
                  firstReplyWithin24HrEvent
               );

               const { ack } = await this._eventPubliser.send(
                  MessageBrokerTopics.MESSAGE_SPECAIAL_EVENTS_TOPIC,
                  firstReplyWithin24HrEventPayload
               );
               if (!ack) return;

               logger.info(`processed-> ${event.eventId}`);
            } catch (e) {
               if (e instanceof EventConsumerMissMatchError || e instanceof ZodValidationError) {
                  logger.warn(e.name);
                  logger.warn(
                     `${RepliedWithinResonableTimeWorker.name}: skipped processing ${event.eventId}`
                  );
                  return;
               }

               logger.error(`error processing: ${event.eventId}`);
               logger.error((e as Error).message);
               console.log(e);

               // DEAD-letter queue
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
