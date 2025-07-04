import { issueHelpfulCommentRewardInputSchema } from '@application/dto/IssueHelpfulCommentReward.dto';
import { logger } from '@config/logger';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IIssueHelpfulCommnetReward } from '@ports/usecases/reward/IIssueHelpfulCommentReward.usercase';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import { Consumer } from 'kafkajs';

export class PostAuthorLikedCommentEventConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _issueHelpfulCommentReward: IIssueHelpfulCommnetReward
   ) {
      this.consumer = this._kafka.createConsumer('reward-service-postAuthorLikedComment-v2');
   }

   start = async () => {
      await this.consumer.connect();
      logger.info('post.author.liked.comment event consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_LIKED_BY_POST_AUTHOR_TOPIC,
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
               if (event.eventType != AppEventsTypes.COMMENT_LIKED_BY_POST_AUTHUR) {
                  throw new EventConsumerMissMatchError();
               }
               const parsed = issueHelpfulCommentRewardInputSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               await this._issueHelpfulCommentReward.execute(parsed.data);

               logger.info(`processed-> ${event.eventType} ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventType} ${event.eventId}`);
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
