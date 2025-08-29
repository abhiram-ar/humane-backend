import { commnetLikeSchema } from '@application/dtos/CommentLike.dto';
import { logger } from '@config/logget';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { ICommentService } from '@ports/ICommentServices';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class CommnetUnLikedByPostAuthorWorker implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _commnetServices: ICommentService
   ) {
      this.consumer = this._kafka.createConsumer('writer-unCommnet-likedBy-post-author-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('comment-unliked by post author consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_UNLIKED_EVENT_TOPIC,
         fromBeginning: true,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_UNLIKED) {
                  throw new EventConsumerMissMatchError();
               }

               const validatedCommentLike = commnetLikeSchema.safeParse(event.payload);
               if (!validatedCommentLike.success) {
                  throw new ZodValidationError(validatedCommentLike.error);
               }

               await this._commnetServices.setCommentLikedByPostAuthor(
                  validatedCommentLike.data,
                  false
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
