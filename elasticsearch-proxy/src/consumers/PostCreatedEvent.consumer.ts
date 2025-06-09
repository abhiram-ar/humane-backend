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
import { PostService } from '@services/Post.services';
import { postSchema } from 'interfaces/dto/post/Post.dto';

export class PostCreatedEventConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _PostServices: PostService
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-post-created-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Post created event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`new Event-> ${event.eventId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.POST_CREATED) {
                  throw new EventBusError('Invalid event type for this comsumer');
               }
               const parsed = postSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               await this._PostServices.upsert(parsed.data);

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
