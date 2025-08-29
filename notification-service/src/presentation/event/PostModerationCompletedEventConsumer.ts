import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { postSchema } from '@application/dtos/Post.dto';
import { IPostModerationNotificationService } from '@application/usercase/interfaces/IPostModerationNotitificationService.usercase';
import { isUserOnline } from '@presentation/websocket/utils/isUserOnline';
import { io } from '@presentation/websocket/ws';

export class PostModerationCompletedEventConsumer implements IConsumer {
   private consumer: Consumer;

   private readonly _topic = 'notification-srv-post-moderation-completed-v2';

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postModerationNotificaionServiec: IPostModerationNotificationService
   ) {
      this.consumer = this._kafka.createConsumer(this._topic);
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('post moderation completed event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
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
               if (event.eventType !== AppEventsTypes.POST_MODERATION_COMPLETED) {
                  logger.warn('foreign event, skipping');
                  return;
               }
               const validatedPost = postSchema.safeParse(event.payload);

               if (!validatedPost.success) {
                  throw new ZodValidationError(validatedPost.error);
               }

               const moderaionFlaggedOrFailedNoti =
                  await this._postModerationNotificaionServiec.create(validatedPost.data);

               const recipient = validatedPost.data.authorId;
               if (!(await isUserOnline(recipient))) return;

               if (moderaionFlaggedOrFailedNoti) {
                  io.to(recipient).emit('push-noti', moderaionFlaggedOrFailedNoti);
               }

               io.to(recipient).emit(
                  'post-moderation-completed',
                  validatedPost.data.id,
                  validatedPost.data.moderationStatus
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
