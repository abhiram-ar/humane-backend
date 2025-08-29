import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { postSchema } from 'interfaces/dto/post/Post.dto';
import { IPostService } from 'interfaces/services/IPost.services';

export class PostCreatedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _PostServices: IPostService
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-post-created-v2');
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

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (
                  event.eventType === AppEventsTypes.POST_CREATED ||
                  event.eventType === AppEventsTypes.POST_MODERATION_COMPLETED
               ) {
                  const parsed = postSchema.safeParse(event.payload);

                  if (!parsed.success) {
                     throw new ZodValidationError(parsed.error);
                  }

                  await this._PostServices.upsert(parsed.data);

                  logger.info(`processed-> ${event.eventId}`);
               } else {
                  logger.warn(`foregin event-> ${event.eventType} ${event.eventId}, skipped`);
               }
            } catch (e) {
               logger.error(`error processing: ${event.eventId}`, { error: e });
            }
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
