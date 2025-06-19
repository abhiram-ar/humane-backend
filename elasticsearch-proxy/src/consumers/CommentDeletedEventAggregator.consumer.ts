import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { commentSchema } from 'interfaces/dto/post/Comment.dto';
import { IPostService } from 'interfaces/services/IPost.services';

export class CommentCreatedEventAggregateConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _postServices: IPostService
   ) {
      this.consumer = this._kafka.createConsumer(
         'elasticsearch-proxy-comment-created-aggregator-v7'
      );
   }

   FLUSH_INTERVAL = 2000; //2s
   MAX_BATCH_SIZE = 100;

   // dual buffer to handle events occuring while the one buffer is being flused
   // alternative use a mutex lock while flushing
   private activeBatch = {
      updates: new Map<string, number>(),
      partitionOffsets: new Map<number, number>(),
   };
   private flushingBatch = {
      updates: new Map<string, number>(),
      partitionOffsets: new Map<number, number>(),
   };

   rotateAndflushBatch = async () => {
      if (this.activeBatch.updates.size === 0) return;

      // rotate buffers before flushing to avoid race conditions
      let temp = this.activeBatch;
      this.flushingBatch = temp;
      this.activeBatch = this.flushingBatch;

      logger.debug('flushing comment count: ' + this.flushingBatch);

      try {
         const ops: { postId: string; delta: number }[] = [];
         for (const [postId, delta] of this.flushingBatch.updates.entries()) {
            ops.push({ postId, delta });
         }

         await this._postServices.bulkUpdateCommentsCount(ops);

         // Commit Kafka offsets
         const offsetEntries = Array.from(this.flushingBatch.partitionOffsets).map(
            ([partition, offset]) => ({
               topic: MessageBrokerTopics.COMMENT_CREATED_EVENTS_TOPIC,
               partition,
               offset: String(offset + 1),
            })
         );
         await this.consumer.commitOffsets(offsetEntries);
      } catch (error) {
         logger.error('error while bulk update flush: ' + (error as Error)?.message);
      } finally {
         this.flushingBatch.updates.clear();
         this.flushingBatch.partitionOffsets.clear();
      }
   };

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment created event aggretator consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_CREATED_EVENTS_TOPIC,
         fromBeginning: true,
      });

      // timebased flushing
      setInterval(() => {
         this.rotateAndflushBatch();
      }, this.FLUSH_INTERVAL);

      await this.consumer.run({
         eachMessage: async ({ message, heartbeat, partition }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            const offset = Number(message.offset);

            logger.debug(`new Event-> ${event.eventType} ${event.eventId}`);
            logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_CREATED) {
                  throw new EventConsumerMissMatchError();
               }
               const parsed = commentSchema.safeParse(event.payload);

               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }

               const postId = parsed.data.postId;
               const prevAggregatedCommentCountDiff = this.activeBatch.updates.get(postId) || 0;

               this.activeBatch.updates.set(postId, prevAggregatedCommentCountDiff + 1);
               const currentPartitionMax = this.activeBatch.partitionOffsets.get(partition) ?? -1;

               if (offset > currentPartitionMax) {
                  this.activeBatch.partitionOffsets.set(partition, offset);
               }

               if (this.activeBatch.updates.size > this.MAX_BATCH_SIZE) {
                  await this.rotateAndflushBatch();
               }

               await heartbeat();

               logger.info(`batched for processing-> ${event.eventType} ${event.eventId}`);
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
