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
import { CommentAggreagateUpdateError } from 'errors/CommentAggreateUpdateError';
import { rewardSchema } from 'interfaces/dto/Reward.dto';
import { IUserServices } from 'interfaces/services/IUser.services';

export class RewardEventsAggregatorConsumer implements IConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _userServiec: IUserServices
   ) {
      this.consumer = this._kafka.createConsumer('elasticsearch-proxy-reward-aggregator-v4');
   }

   private readonly _FLUSH_INTERVAL = 1000; //3s
   private readonly _MAX_BATCH_SIZE = 100;

   // dual buffer, one to handle events occuring while the other buffer is being flused
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
      // 2nd flag condition: if the current active batch fills up quicky,
      // then this function can execute prematurly before the current flushing bactch completes
      if (this.activeBatch.updates.size === 0 || this.flushingBatch.updates.size > 0) return;

      // rotate buffers before flushing to avoid race conditions
      let temp = this.activeBatch;
      this.activeBatch = this.flushingBatch;
      this.flushingBatch = temp;

      logger.debug(`🔃 Flushing ${this.flushingBatch.updates.size} reward diff`);

      try {
         const ops: { userId: string; delta: number }[] = [];
         for (const [userId, delta] of this.flushingBatch.updates.entries()) {
            ops.push({ userId, delta });
         }

         const { ack } = await this._userServiec.bulkUpdateHumaneScoreFromDiff(ops);
         if (!ack) {
            throw new CommentAggreagateUpdateError();
         }

         // Commit Kafka offsets
         const offsetEntries = Array.from(this.flushingBatch.partitionOffsets).map(
            ([partition, offset]) => ({
               topic: MessageBrokerTopics.REWARD_EVENTS_TOPIC,
               partition,
               offset: String(offset + 1),
            })
         );
         await this.consumer.commitOffsets(offsetEntries);
      } catch (error) {
         logger.error('error while bulk reward diff flush: ' + (error as Error)?.message);
      } finally {
         this.flushingBatch.updates.clear();
         this.flushingBatch.partitionOffsets.clear();
      }
   };

   start = async () => {
      await this.consumer.connect();
      logger.info('Reward event aggretator consumer connected ');

      await this.consumer.subscribe({
         topic: MessageBrokerTopics.REWARD_EVENTS_TOPIC,
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
               if (event.eventType !== AppEventsTypes.USER_REWARDED) {
                  throw new EventConsumerMissMatchError();
               }
               const { data, error, success } = rewardSchema.safeParse(event.payload);

               if (!success) {
                  throw new ZodValidationError(error);
               }

               const userId = data.userId;
               const prevAggregatedRewardDiff = this.activeBatch.updates.get(userId) || 0;

               this.activeBatch.updates.set(userId, prevAggregatedRewardDiff + data.amount);
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
