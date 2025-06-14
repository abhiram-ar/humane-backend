import { logger } from '@config/logger';
import { postSchema } from '@dtos/Post.dto';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { FeedServices } from '@services/feed.services';
import {
   AppEvent,
   AppEventsTypes,
   EventBusError,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class PostDeletedEventConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _timelineServies: FeedServices
   ) {
      this.consumer = this._kafka.createConsumer('feed-srv-post-deleted-v3');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Post deleted event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.POST_DELETED_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`new Event-> ${event.eventId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.POST_DELETED) {
                  throw new EventBusError('Invalid event type for this comsumer');
               }

               const validatedPost = postSchema.safeParse(event.payload);
               if (!validatedPost.success) {
                  throw new ZodValidationError(validatedPost.error);
               }

               await this._timelineServies.deletePostFromAllTimeline(validatedPost.data.id);

               // update the cache - more detail why we are not doing it in Readme.md

               logger.info(`processed-> ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventId}`);
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
