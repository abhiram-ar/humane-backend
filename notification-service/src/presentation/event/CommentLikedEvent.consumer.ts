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
import { commnetLikeSchema } from '@application/dtos/CommentLike.dto';
import { ICommentLikesNotificationService } from '@application/usercase/interfaces/ICommentLikesNotificationService.usecase';
import { io } from '@presentation/websocket/ws';
import { isUserOnline } from '@presentation/websocket/utils/isUserOnline';

export class CommentLikedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _commentLikesNotificationService: ICommentLikesNotificationService
   ) {
      this.consumer = this._kafka.createConsumer('notification-srv-comment-liked-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment liked event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_LIKED_EVENT_TOPIC,
      });

      // TODO: turn this into batched operation
      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_LIKED) {
                  throw new EventConsumerMissMatchError();
               }

               const {
                  data: validatedCommentLike,
                  error,
                  success,
               } = commnetLikeSchema.safeParse(event.payload);

               if (!success) {
                  throw new ZodValidationError(error);
               }

               const noti = await this._commentLikesNotificationService.create(
                  validatedCommentLike
               );

               if (noti && (await isUserOnline(noti.reciverId))) {
                  // we are creating notification and likeCount === 1 => fresh notificaion
                  if (noti.metadata.likeCount && noti.metadata.likeCount === 1) {
                     io.to(noti.reciverId).emit('push-noti', noti);
                  }
                  io.to(noti.reciverId).emit('update-noti', noti);
               }
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
