import { logger } from '@config/logger';
import { postSchema } from '@dtos/Post.dto';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IUserService } from '@ports/IUserService';
import { TimelineServices } from '@services/Timeline.services';
import {
   AppEvent,
   AppEventsTypes,
   EventBusError,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class PostCreatedEventConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _timelineServies: TimelineServices,
      private readonly _userServices: IUserService
   ) {
      this.consumer = this._kafka.createConsumer('feed-srv-post-created-v3');
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

               const validatedPost = postSchema.safeParse(event.payload);
               if (!validatedPost.success) {
                  throw new ZodValidationError(validatedPost.error);
               }

               // get friends list
               const result = await this._userServices.getAllFriendsNonHotUser(
                  validatedPost.data.authorId
               );

               // if user is hot user skip
               if (result.isHotUser) {
                  logger.info('user is hot, skipping timeline update for friends');
                  return;
               }
               // if user is normal -> write post to each friends timeline
               const dto = {
                  userIds: result.friends,
                  authorId: validatedPost.data.authorId,
                  postId: validatedPost.data.id,
               };
               await this._timelineServies.appendPostToMultipleUserTimeline(dto);

               // update the cache

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
