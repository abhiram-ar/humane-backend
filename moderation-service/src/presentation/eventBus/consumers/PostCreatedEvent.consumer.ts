import { logger } from '@config/logger';
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
import { Consumer } from 'kafkajs';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { IModeratePostMedia } from '@application/port/usecases/IModeratePostMedia';
import { NSFWJSClassNames } from '@infrastructure/NSFWImageClassifierService/nsfwjs/Types/NSFWJSClassNames.type';
import { ENV } from '@config/env';
import { IEventPublisher } from '@application/port/IEventProducer';

export class PostCreatedEventConsumer implements IConsumer {
   private _consumer: Consumer;
   private readonly _topic = MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC;
   private readonly _groupId = 'moderation-service-post-created-v3';

   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _moderationService: IModeratePostMedia<NSFWJSClassNames>,
      private readonly _eventPublisher: IEventPublisher
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

      this._kafka.getInstance().consumer({
         groupId: this._groupId,
         heartbeatInterval: 30 * 1000,
         sessionTimeout: 60 * 1000,
         rebalanceTimeout: 100 * 1000,
      });

      await this._consumer.subscribe({
         topic: this._topic,
      });

      await this._consumer.run({
         autoCommit: false,
         eachMessage: async ({ message, partition, heartbeat }) => {
            // process 1 messaage at a time
            this._consumer.pause([{ topic: this._topic, partitions: [partition] }]);
            const timer = setInterval(() => {
               logger.info(`${PostCreatedEventConsumer.name}: heartbeat`);
               heartbeat;
            }, 7 * 1000);

            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as AppEvent;

            logger.debug(`🔽 new Event-> ${event.eventType} ${event.eventId}`);
            // logger.verbose(JSON.stringify(event, null, 2));

            try {
               if (event.eventType !== AppEventsTypes.POST_CREATED) {
                  logger.error(new EventConsumerMissMatchError());
                  return;
               }
               const { data: post, success, error } = postSchema.safeParse(event.payload);

               if (!success) {
                  logger.error(error);
                  return;
               }

               // check if there is video
               if (!post.rawAttachmentKey || !post.attachmentType) {
                  const postModeratedEventPayload: PostModeratedPayload = {
                     postId: post.id,
                     result: {
                        success: true,
                        flagged: false,
                     },
                  };

                  const postModeratedEvent = createEvent(
                     AppEventsTypes.POST_MODERATED,
                     postModeratedEventPayload
                  );

                  const { ack } = await this._eventPublisher.send(
                     MessageBrokerTopics.CONTENT_MODERATION_EVENT_TOPIC,
                     postModeratedEvent
                  );

                  if (!ack) throw new EventBusError();

                  return;
               }

               const res = await this._moderationService.execute({
                  attachmentKey: post.rawAttachmentKey,
                  attachmentType: post.attachmentType,
                  bucketName: ENV.AWS_S3_BUCKET_NAME as string,
                  hotClassNames: ['Porn', 'Hentai'],
                  cleanup: true,
               });

               console.log('result', JSON.stringify(res, null, 2));

               if (!res.success) {
                  const retryModerateionEvent = createEvent(
                     AppEventsTypes.POST_CREATED_MODERATION_RETRY,
                     event.payload
                  );

                  const { ack } = await this._eventPublisher.send(
                     MessageBrokerTopics.CONTENT_MODERATION_REREY_EVENT_TOPIC,
                     retryModerateionEvent
                  );
                  if (!ack) throw new EventBusError();

                  return;
               }

               const postModeratedEvent = createEvent(AppEventsTypes.POST_MODERATED, {
                  postId: post.id,
                  result: res,
               });

               const { ack } = await this._eventPublisher.send(
                  MessageBrokerTopics.CONTENT_MODERATION_EVENT_TOPIC,
                  postModeratedEvent
               );

               if (!ack) throw new EventBusError();

               const offset = {
                  topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
                  partition,
                  offset: String(message.offset + 1),
               };
               await this._consumer.commitOffsets([offset]);
               this._consumer.resume([{ topic: this._topic, partitions: [partition] }]);

               logger.info(`processed-> ${event.eventId}`);
            } catch (e) {
               logger.error(`error processing: ${event.eventId}`);
               logger.error((e as Error).message);
               console.log(e);

               try {
                  if (
                     !(e instanceof EventBusError) &&
                     event.eventType === AppEventsTypes.POST_CREATED
                  ) {
                     const retryModerateionEvent = createEvent(
                        AppEventsTypes.POST_CREATED_MODERATION_RETRY,
                        event.payload
                     );

                     const { ack } = await this._eventPublisher.send(
                        MessageBrokerTopics.CONTENT_MODERATION_REREY_EVENT_TOPIC,
                        retryModerateionEvent
                     );

                     if (!ack) throw new EventBusError();
                  }

                  // commit offset so we dont get stuck on the same message
                  const offset = {
                     topic: MessageBrokerTopics.POST_CREATE_EVENTS_TOPIC,
                     partition,
                     offset: String(Number(message.offset) + 1),
                  };
                  await this._consumer.commitOffsets([offset]);
               } catch (commitErr) {
                  // @ts-ignore
                  logger.error(`Failed to commit or send to retry: ${commitErr.message}`);
               } finally {
                  clearInterval(timer);
                  this._consumer.resume([{ topic: this._topic, partitions: [partition] }]);
               }
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
