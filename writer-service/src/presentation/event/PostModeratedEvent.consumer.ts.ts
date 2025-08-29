import {
   UpdatePostModerationInputDTO,
   updatePostModerationInputSchema,
} from '@application/dtos/UpdatePostModeration.dto';
import { logger } from '@config/logget';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IEventPublisher } from '@ports/IEventProducer';
import { IPostService } from '@ports/IPostService';
import {
   AppEvent,
   AppEventsTypes,
   createEvent,
   EventBusError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class PostModeratedEventConsumer implements IConsumer {
   private _consumer: Consumer;
   private readonly _topic: string;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postService: IPostService,
      private readonly _eventPublisher: IEventPublisher
   ) {
      this._topic = 'writer-service-post-moderated-evnet-consumer-v2';
      this._consumer = this._kafka.createConsumer(this._topic);
   }

   start = async () => {
      await this._consumer.connect();
      logger.info('post moderated evnet consumer connected ');

      await this._consumer.subscribe({
         topic: MessageBrokerTopics.CONTENT_MODERATION_EVENT_TOPIC,
         fromBeginning: true,
      });

      await this._consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType !== AppEventsTypes.POST_MODERATED) {
                  logger.warn('foreign event');
                  return;
               }

               const dto: UpdatePostModerationInputDTO = {
                  postId: event.payload.postId,
                  result: event.payload.result,
               };
               const { data, error, success } = updatePostModerationInputSchema.safeParse(dto);
               if (!success) {
                  throw new ZodValidationError(error);
               }

               const res = await this._postService.updateModerationData(data);
               if (!res) {
                  logger.warn(`Invalid postId event(${event.eventId}), skipping`);
                  return;
               }
               console.log(res);

               const postModerationCompletedEvent = createEvent(
                  AppEventsTypes.POST_MODERATION_COMPLETED,
                  res
               );
               const { ack } = await this._eventPublisher.send(
                  MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
                  postModerationCompletedEvent
               );
               if (!ack) throw new EventBusError();

               logger.info(`processed -> ${event.eventType} ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventType} ${event.eventId}`, { error: e });
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
