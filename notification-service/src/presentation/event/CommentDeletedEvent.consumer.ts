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
import { commentSchema } from '@application/dtos/Comment.dto';
import { IPostGotCommentNotificationService } from '@application/usercase/interfaces/IPostGotCommentNotification.usecase';
import { isUserOnline } from '@presentation/websocket/utils/isUserOnline';
import { io } from '@presentation/websocket/ws';
import { ICommentLikesNotificationService } from '@application/usercase/interfaces/ICommentLikesNotificationService.usecase';

export class CommentDeletedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postGotCommentNotification: IPostGotCommentNotificationService,
      private readonly _commentlikedNotification: ICommentLikesNotificationService
   ) {
      this.consumer = this._kafka.createConsumer('notification-srv-comment-deleted-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment deleted event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_DELTED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_DELTED) {
                  throw new EventConsumerMissMatchError();
               }
               const validatedComment = commentSchema.safeParse(event.payload);

               if (!validatedComment.success) {
                  throw new ZodValidationError(validatedComment.error);
               }

               const noti = await this._postGotCommentNotification.deleteNotificationByCommentId(
                  validatedComment.data.id
               );
               if (noti && (await isUserOnline(noti.reciverId))) {
                  io.to(noti.reciverId).emit('remove-noti', {
                     ...noti,
                  });
               }

               await this._commentlikedNotification.deleteCommentLikesNotificationByCommentId(
                  validatedComment.data.id
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
