import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
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

export class CommentLikeCountWorker implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _commentServices: ICommentService
   ) {
      this.consumer = this._kafka.createConsumer(
         'elasticsearch-proxy-comment-like-count-worker-v9'
      );
   }

   private readonly _FLUSH_INTERVAL = 1000; //1s
   private readonly _MAX_BATCH_SIZE = 1000;

   // dual buffer, one to handle events occuring while the other buffer is being flused
   private activeBatch = {
      updates: new Map<string, number>(),
      partitionOffsets: new Map<number, number>(),
   };
   private flushingBatch = {
      updates: new Map<string, number>(),
      partitionOffsets: new Map<number, number>(),
   };

   rotateAndflushBatch = async () => {
      // 2nd flag condition: if the current active batch fills up quicky,
      // then this function can execute prematurly before the current flushing bactch completes
      if (this.activeBatch.updates.size === 0 || this.flushingBatch.updates.size > 0) return;

      // rotate buffers before flushing to avoid race conditions
      let temp = this.activeBatch;
      this.activeBatch = this.flushingBatch;
      this.flushingBatch = temp;

      logger.debug(`🔃 Flushing ${this.flushingBatch.updates.size} comment like count diff`);

      try {
         const dto: BulkUpdateCommentLikeCountInputDTO = [];
         for (const [key, value] of this.flushingBatch.updates.entries()) {
            dto.push({ commentId: key, likeCountDiff: value });
         }

         await this._commentServices.bulkUpdateCommentLikeCountFromDiff(dto);

         // Commit Kafka offsets
         const offsetEntries = Array.from(this.flushingBatch.partitionOffsets).map(
            ([partition, offset]) => ({
               topic: MessageBrokerTopics.COMMENT_LIKED_EVENT_TOPIC,
               partition,
               offset: String(offset + 1),
            })
         );
         await this.consumer.commitOffsets(offsetEntries);
      } catch (error) {
         logger.error(
            'error while bulk updating commnet likes count diff flush: ' + (error as Error)?.message
         );
      } finally {
         this.flushingBatch.updates.clear();
         this.flushingBatch.partitionOffsets.clear();
      }
   };

   start = async () => {
      await this.consumer.connect();
      logger.info('Comment like count worker consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.COMMENT_LIKED_EVENT_TOPIC,
         fromBeginning: true,
      });

      // timebased flushing
      setInterval(() => {
         this.rotateAndflushBatch();
      }, this._FLUSH_INTERVAL);

      await this.consumer.run({
         autoCommit: false,
         eachMessage: async ({ message, heartbeat, partition }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            const offset = Number(message.offset);

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType != AppEventsTypes.COMMENT_LIKED) {
                  throw new EventConsumerMissMatchError();
               }

               const { data, error, success } = commnetLikeSchema.safeParse(event.payload);
               if (!success) {
                  throw new ZodValidationError(error);
               }

               const commentId = data.commentId;
               let lastComputedCountDiff = this.activeBatch.updates.get(commentId) ?? 0;
               this.activeBatch.updates.set(commentId, lastComputedCountDiff + 1);

               const currentPartitionMax = this.activeBatch.partitionOffsets.get(partition) ?? -1;
               if (offset > currentPartitionMax) {
                  this.activeBatch.partitionOffsets.set(partition, offset);
               }

               if (this.activeBatch.updates.size > this._MAX_BATCH_SIZE) {
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
