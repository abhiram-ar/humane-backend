import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { IPostGotCommentNotificationService } from '@application/usercase/interfaces/IPostGotCommentNotification.usecase';
import { postSchema } from '@application/dtos/Post.dto';

export class PostDeletedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postGotCommentNotification: IPostGotCommentNotificationService
   ) {
      this.consumer = this._kafka.createConsumer('notification-srv-post-deleted-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('post deleted event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.POST_DELETED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.POST_DELETED) {
                  throw new EventConsumerMissMatchError();
               }
               const validatedPost = postSchema.safeParse(event.payload);

               if (!validatedPost.success) {
                  throw new ZodValidationError(validatedPost.error);
               }

               await this._postGotCommentNotification.deleteNotificationsByPostId(
                  validatedPost.data.id
               );

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
