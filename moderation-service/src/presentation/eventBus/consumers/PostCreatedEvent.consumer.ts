import { logger } from '@config/logger';
import {
   AppEvent,
   AppEventsTypes,
   createEvent,
   EventBusError,
   IConsumer,
   MessageBrokerTopics,
   postSchema,
} from 'humane-common';
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';

import { RabbitMQWorkerQueuePublisher } from '@infrastructure/workerQueue/WorkerQueuePublisher';
import { Queues } from '@infrastructure/workerQueue/constants/Queues';
import { IEventPublisher } from '@application/port/IEventProducer';
import {
   WorkerQueueError,
   WorkerQueueErrorMsg,
} from '@infrastructure/workerQueue/error/WorkerQueueError';

export class PostCreatedEventConsumer implements IConsumer {
   private _consumer: Consumer;
   private readonly _topic = MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC;
   private readonly _groupId = 'moderation-service-post-created-v4';

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _workerQueuePubliserr: RabbitMQWorkerQueuePublisher,
      private readonly _eventPubliser: IEventPublisher
   ) {
      this._consumer = this._kafka.createConsumer(this._groupId, {
         heartbeatInterval: 30 * 1000,
         sessionTimeout: 60 * 1000,
         rebalanceTimeout: 100 * 1000,
      });
   }

   start = async () => {
      await this._consumer.connect();
      logger.info('Post created event consumer connected ');

      await this._consumer.subscribe({
         topic: this._topic,
      });

      await this._consumer.run({
         autoCommit: false,
         eachMessage: async ({ message, partition, heartbeat }) => {
            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            if (event.eventType !== AppEventsTypes.POST_CREATED) {
               logger.warn(`foregin event-> ${event.eventType} ${event.eventId}, skipped`);
               return;
            }
            const { data: post, success, error } = postSchema.safeParse(event.payload);

            if (!success) {
               logger.error(error);
               return;
            }

            try {
               // retry at interval untill success
               let retryCount = 0;
               const maxRetries = 3;
               let ack;
               await heartbeat();
               while (retryCount < maxRetries) {
                  try {
                     const result = await this._workerQueuePubliserr.addToQueue({
                        queueName: Queues.MODERATE_MEDIA,
                        data: event,
                     });
                     ack = result.ack;
                     if (ack) {
                        logger.info(`🔃 offloaded event to worker queue-> ${event.eventId}`);
                        break; // exit loop on success
                     }
                  } catch (err) {
                     logger.warn(
                        `Queue publish attempt ${retryCount + 1} failed: ${(err as Error).message}`
                     );
                  }

                  retryCount++;
                  if (retryCount < maxRetries) {
                     await heartbeat();
                     await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
               }

               if (!ack) {
                  throw new WorkerQueueError(WorkerQueueErrorMsg.PRODUCER_MAX_RETRY_REACED);
               }

               const offset = {
                  topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
                  partition,
                  offset: String(Number(message.offset) + 1),
               };
               await this._consumer.commitOffsets([offset]);
               logger.info(`Processed event -> ${event.eventId}`);
            } catch (e) {
               logger.error(`consumer: error processing: ${event.eventId}`);
               logger.error((e as Error).message);

               try {
                  if (event.eventType === AppEventsTypes.POST_CREATED) {
                     const retryModerateionEvent = createEvent(AppEventsTypes.POST_MODERATED, {
                        postId: post.id,
                        result: { success: false },
                     });

                     const { ack } = await this._eventPubliser.send(
                        MessageBrokerTopics.CONTENT_MODERATION_EVENT_TOPIC,
                        retryModerateionEvent
                     );

                     if (!ack) throw new EventBusError();
                  }

                  // commit offset so we dont get stuck on the same message
               } catch (commitErr) {
                  // @ts-ignore
                  logger.error(`consumer: Failed to commit or send to retry: ${commitErr.message}`);
                  const offset = {
                     topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
                     partition,
                     offset: String(Number(message.offset) + 1),
                  };
                  await this._consumer.commitOffsets([offset]);
               }
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
