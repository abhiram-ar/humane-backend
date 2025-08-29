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
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { io } from '@presentation/websocket/ws';

export class CommentCreatedEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postGotCommentNotification: IPostGotCommentNotificationService,
      private readonly _esProxy: IElasticSearchProxyService
   ) {
      this.consumer = this._kafka.createConsumer('notification-srv-comment-created-v1');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment created event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_CREATED_EVENTS_TOPIC,
      });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_CREATED) {
                  throw new EventConsumerMissMatchError();
               }
               const parsed = commentSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               const noti = await this._postGotCommentNotification.create(parsed.data);

               if (noti && (await isUserOnline(noti.reciverId))) {
                  const [requesterDetails] = await this._esProxy.getUserBasicDetails(noti.actorId);

                  if (requesterDetails) {
                     io.to(noti.reciverId).emit('push-noti', {
                        ...noti,
                        actionableUser: requesterDetails,
                     });
                  } else {
                     logger.warn('No requester basic details from ES proxy');
                  }
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
