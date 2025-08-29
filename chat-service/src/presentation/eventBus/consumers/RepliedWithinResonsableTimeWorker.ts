import {
   RepliedWithinIntervalUserMsgIngputDTO,
   repliedWithinIntervalUserMsgSchema,
} from '@application/dto/RepliedWithinInterval.dto';
import { AppConstants } from '@config/constants';
import { logger } from '@config/logger';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { ICacheService } from '@ports/services/ICacheService';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { IRepliedWithin } from '@ports/usecases/IRepliedWithinInterval.usecase';
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
   static resonableTimeInMs = AppConstants.TIME_24HRS;

   static msgProcessedInIntervalKey = (input: { convoID: string; senderId: string }) => {
      const cacheKey = `repliedIn24Hr:conv-${input.convoID}:user-${input.senderId}`;
      return cacheKey;
   };

   static checkIfUserIsAlreadyProcessedInInterval = (input: {
      userCovoLastProcessedAt: string | null;
      newMsgSentAt: Date;
   }): boolean => {
      if (!input.userCovoLastProcessedAt) return false;

      let lastUserConvoProcessedAt = new Date(input.userCovoLastProcessedAt).getTime();
      let timeDelta = new Date(input.newMsgSentAt).getTime() - lastUserConvoProcessedAt;

      return timeDelta < RepliedWithinResonableTimeWorker.resonableTimeInMs ? true : false;
   };

   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _repliedWithIn: IRepliedWithin,
      private readonly _eventPubliser: IEventPublisher,
      private readonly _cache: ICacheService
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
               const dto: RepliedWithinIntervalUserMsgIngputDTO = {
                  messageId: userMessage.id,
                  senderId: userMessage.senderId,
                  conversationId: userMessage.conversationId,
                  sendAt: userMessage.sendAt,
               };

               const {
                  data: validatedUserMsg,
                  success,
                  error,
               } = repliedWithinIntervalUserMsgSchema.safeParse(dto);
               if (!success) {
                  throw new ZodValidationError(error);
               }

               const cacheKey = RepliedWithinResonableTimeWorker.msgProcessedInIntervalKey({
                  convoID: validatedUserMsg.conversationId,
                  senderId: validatedUserMsg.senderId,
               });
               const userCovoLastProcessedAt = await this._cache.get(cacheKey);

               if (
                  RepliedWithinResonableTimeWorker.checkIfUserIsAlreadyProcessedInInterval({
                     userCovoLastProcessedAt,
                     newMsgSentAt: validatedUserMsg.sendAt,
                  })
               ) {
                  logger.debug(
                     'already processed user-msg for this convo in provided internal: skipped processing'
                  );
                  return;
               }

               //check if other message exist in chat other than user within last 24 hr
               const res = await this._repliedWithIn.interval({
                  interval: RepliedWithinResonableTimeWorker.resonableTimeInMs,
                  userMsg: validatedUserMsg,
               });
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

               await this._cache.set(cacheKey, validatedUserMsg.sendAt.toISOString(), {
                  expiryInMS: RepliedWithinResonableTimeWorker.resonableTimeInMs,
               });

               logger.info(`processed-> ${event.eventId}`);
            } catch (e) {
               if (e instanceof EventConsumerMissMatchError || e instanceof ZodValidationError) {
                  logger.warn(e.name);
                  logger.warn(
                     `${RepliedWithinResonableTimeWorker.name}: skipped processing ${event.eventId}`
                  );
                  return;
               }

               logger.error(`error processing: ${event.eventId}`, { error: e });

               // DEAD-letter queue
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
