import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { CommentService } from '@services/Comment.services';
import { commentSchema } from 'interfaces/dto/post/Comment.dto';

export class CommentCreatedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _CommentServices: CommentService
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-comment-created-v4');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment created event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_CREATED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_CREATED) {
                  throw new EventConsumerMissMatchError();
               }
               const parsed = commentSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               await this._CommentServices.upsert(parsed.data);

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
