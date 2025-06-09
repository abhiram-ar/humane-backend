import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventBusError,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { CommentService } from '@services/Comment.services';
import { commentSchema } from 'interfaces/dto/post/Comment.dto';

export class CommentDeletedEventConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _commentServices: CommentService
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-comment-deleted-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment deleted event consumer connected');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_DELTED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`new ${event.eventType} Event-> ${event.eventId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_DELTED) {
                  throw new EventBusError('Invalid event type for this comsumer');
               }
               const parsed = commentSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               await this._commentServices.delete(parsed.data.id);

               logger.info(`processed-> ${event.eventType} ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventType} ${event.eventId}`);
               logger.error((e as Error).message);
               console.log(e);
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
