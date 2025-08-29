import { logger } from '@config/logger';
import amqplib, { ChannelModel, Channel } from 'amqplib';
import {
   WorkerQueueError,
   WorkerQueueErrorMsg,
} from '../../infrastructure/workerQueue/error/WorkerQueueError';
import { Queues } from '@infrastructure/workerQueue/constants/Queues';
import {
   AppEvent,
   AppEventsTypes,
   createEvent,
   EventBusError,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   PostModeratedPayload,
   postSchema,
} from 'humane-common';
import { IModeratePostMedia } from '@application/port/usecases/IModeratePostMedia';
import { NSFWJSClassNames } from '@infrastructure/NSFWImageClassifierService/nsfwjs/Types/NSFWJSClassNames.type';
import { IEventPublisher } from '@application/port/IEventProducer';
import { ENV } from '@config/env';
import { RabbitMQWorkerQueuePublisher } from '@infrastructure/workerQueue/WorkerQueuePublisher';

export class RabbitMQPostMediaModerationWorker implements IConsumer {
   private _connection: ChannelModel | undefined;
   private _consumerChannel: Channel | undefined;

   private _forceConnClosed: boolean = false; // just to keep not on how the connection closed, was it manual or forced
   constructor(
      private readonly _moderationService: IModeratePostMedia<NSFWJSClassNames>,
      private readonly _eventPublisher: IEventPublisher,
      private readonly _workerQueuePubliser: RabbitMQWorkerQueuePublisher
   ) {}

   connect = async () => {
      this._forceConnClosed = false;
      this._connection = await amqplib.connect(ENV.RABBITMQ_CONNECTION_STRING as string, {
         timeout: 10 * 60 * 1000,
      });
      this._connection.on('close', () => {
         if (this._forceConnClosed) return;
         process.nextTick(() => {
            logger.debug('nextTick: rabbimq worker re-connect callback fired');
            this.connect();
         });
      });
   };

   getConsumerChannel = async (): Promise<Channel | undefined> => {
      if (!this._connection) return undefined;
      if (!this._consumerChannel) {
         this._consumerChannel = await this._connection.createChannel();
      }
      return this._consumerChannel;
   };

   // helper function to send moderation event which is invoked in multiple places
   private _sendModerationEvent = async (
      paylod: PostModeratedPayload
   ): Promise<{ ack: boolean }> => {
      const postModeratedEvent = createEvent(AppEventsTypes.POST_MODERATED, paylod);

      return await this._eventPublisher.send(
         MessageBrokerTopics.CONTENT_MODERATION_EVENT_TOPIC,
         postModeratedEvent
      );
   };

   start = async (): Promise<void> => {
      this._forceConnClosed = false;

      let consumerChan = await this.getConsumerChannel();
      if (!consumerChan) {
         throw new WorkerQueueError(WorkerQueueErrorMsg.NO_CHANNEL);
      }

      await consumerChan.assertQueue(Queues.MODERATE_MEDIA, { durable: true });
      await consumerChan.prefetch(1);

      consumerChan.consume(Queues.MODERATE_MEDIA, async (msg) => {
         if (!msg) return;

         const event = JSON.parse(msg.content.toString()) as AppEvent;
         logger.debug(`🔽 new job -> ${event.eventType} ${event.eventId}`);

         if (event.eventType !== AppEventsTypes.POST_CREATED) {
            logger.warn(new EventConsumerMissMatchError());
            consumerChan.ack(msg);
            return;
         }

         const { data: post, success, error } = postSchema.safeParse(event.payload);
         if (!success) {
            logger.error(error);
            consumerChan.ack(msg);
            return;
         }

         try {
            // check if there is no attachment there is not need of moderation
            if (!post.rawAttachmentKey || !post.attachmentType) {
               const postModeratedEventPayload: PostModeratedPayload = {
                  postId: post.id,
                  result: {
                     success: true,
                     flagged: false,
                  },
               };
               const { ack } = await this._sendModerationEvent(postModeratedEventPayload);
               if (!ack) throw new EventBusError();

               consumerChan.ack(msg);
               return;
            }

            const res = await this._moderationService.execute({
               attachmentKey: post.rawAttachmentKey,
               attachmentType: post.attachmentType,
               bucketName: ENV.AWS_S3_BUCKET_NAME as string,
               hotClassNames: ['Porn', 'Hentai'],
               cleanup: true,
            });

            // @ts-ignore
            logger.debug(`event ${event.eventId}: success-${res.success}, flagged:${res.flagged}`);
            // logger.verbose(JSON.stringify({ moderation: 'Result', result: res }, null, 2));

            if (!res.success) {
               event.version = (event.version ?? 0) + 1;

               // not considering retry to we manyally requeue 3 times
               // or automatically requeued by nack - assumed something wrong with event
               if (event.version > 3 || msg.fields.redelivered) {
                  logger.warn(`Worker: retry failed, marking moderation as failed`);
                  consumerChan.nack(msg, false, false);

                  const postModeratedEventPayload: PostModeratedPayload = {
                     postId: post.id,
                     result: {
                        success: res.success,
                     },
                  };
                  const { ack: eventBusAck } = await this._sendModerationEvent(
                     postModeratedEventPayload
                  );
                  if (!eventBusAck) throw new EventBusError();

                  return;
               }

               // manually requeing with updated version
               const { ack: workerQueueAck } = await this._workerQueuePubliser.addToQueue({
                  queueName: Queues.MODERATE_MEDIA,
                  data: event,
               });

               // if we were able to manually requeue, ack this msg
               if (workerQueueAck) {
                  logger.debug(`worker: manully requed the job`);
                  consumerChan.ack(msg);
               } else {
                  logger.debug('worker: automaticly job requed');
                  consumerChan.nack(msg, false, true);
               }
               return;
            }

            // mooderation completed sucessfully
            const { ack } = await this._sendModerationEvent({ postId: post.id, result: res });
            if (!ack) throw new EventBusError();

            logger.info(`worker processed-> ${event.eventId}`);

            consumerChan.ack(msg);
         } catch (e) {
            logger.error(`worker: error processing: ${event.eventId}`, { error: e });

            try {
               // we dont want to nack this message every this this is failed
               // what if there is something wrong with the event and it cant be proceesses
               // so add this as a retry not first try
               event.version = (event.version ?? 0) + 1;
               if (event.version > 3 || msg.fields.redelivered) {
                  consumerChan.nack(msg, false, false); // dont requee
                  const postModeratedEventPayload: PostModeratedPayload = {
                     postId: post.id,
                     result: {
                        success: false,
                     },
                  };
                  const { ack: eventBusAck } = await this._sendModerationEvent(
                     postModeratedEventPayload
                  );
                  if (!eventBusAck) throw new EventBusError();

                  return;
               }

               const { ack } = await this._workerQueuePubliser.addToQueue({
                  queueName: Queues.MODERATE_MEDIA,
                  data: event,
               });

               // if we were able to manually requeue, ack this msg
               if (ack) {
                  logger.debug(`worker: manully requed the job`);
                  consumerChan.ack(msg);
               } else {
                  logger.debug('worker: automaticly job requed');
                  consumerChan.nack(msg, false, true);
               }
               return;
            } catch (error) {
               logger.error('wokrer all fallback mechanism faliled', { error });
            }
         }
      });
   };

   stop = async (): Promise<void> => {
      this._forceConnClosed = true;
      await this._consumerChannel?.close();
      this._consumerChannel = undefined;
      await this._connection?.close();
      this._connection = undefined;
   };
}
