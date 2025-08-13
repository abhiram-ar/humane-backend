import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   postSchema,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';

export class PostCreatedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(private readonly _kafka: KafkaSingleton) {
      this.consumer = this._kafka.createConsumer('moderation-service-post-created-v2');
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
               if (event.eventType != AppEventsTypes.POST_CREATED) {
                  throw new EventConsumerMissMatchError();
               }
               const { data: post, success, error } = postSchema.safeParse(event.payload);

               if (!success) {
                  throw new ZodValidationError(error);
               }

               // check if there is video
               if (post.rawAttachmentKey && post.attachmentType) {
                  // 
                     

                  // do moderation of attachment
                  
                  //clean up
               }

               // pubish moderated event


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
