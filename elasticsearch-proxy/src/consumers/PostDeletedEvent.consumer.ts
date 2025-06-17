import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventBusError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { postSchema } from 'interfaces/dto/post/Post.dto';
import { ICommentService } from 'interfaces/services/IComment.services';
import { IPostService } from 'interfaces/services/IPost.services';

export class PostDeletedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _PostServices: IPostService,
      private readonly _commentServices: ICommentService
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-post-deleted-v2');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Post deleted event consumer connected');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.POST_DELETED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`new ${event.eventType} Event-> ${event.eventId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.POST_DELETED) {
                  throw new EventBusError('Invalid event type for this comsumer');
               }
               const validatedPost = postSchema.safeParse(event.payload);

               if (!validatedPost.success) {
                  throw new ZodValidationError(validatedPost.error);
               }

               await this._PostServices.delete(validatedPost.data.id);
               await this._commentServices.deleteAllPostComments(validatedPost.data.id)

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
