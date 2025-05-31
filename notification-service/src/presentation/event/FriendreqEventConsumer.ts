import { Consumer } from 'kafkajs';
import { MessageBrokerTopics, UserSignupEvent } from 'humane-common';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { logger } from '@config/logger';
export class FriendReqEventConsumer {
   private _consumer: Consumer;
   constructor(private readonly _kafka: KafkaSingleton) {
      this._consumer = this._kafka.createConsumer('friend-req-event-consumer-5');
   }

   start = async () => {
      await this._consumer.connect();
      logger.info('Friendreq event consumer connected');

      await this._consumer.subscribe({
         topic: MessageBrokerTopics.FRIENDSHIP_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this._consumer.run({
         eachMessage: async ({ message }) => {
            if (!message.value) {
               throw new Error('No body/value for message');
            }
            const event = JSON.parse(message.value.toString()) as UserSignupEvent;

            logger.verbose(JSON.stringify(event, null, 2));
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
