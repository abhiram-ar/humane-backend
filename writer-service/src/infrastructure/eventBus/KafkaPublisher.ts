import { AppEvent } from 'humane-common';
import KafkaSingleton from './KafkaSingleton';
import { Producer } from 'kafkajs';
import { IEventPublisher } from '@ports/IEventProducer';
import { logger } from '@config/logget';

export class KafkaPublisher implements IEventPublisher {
   producer: Producer;

   constructor(readonly _kafka: KafkaSingleton) {
      this.producer = _kafka.getProducer();
   }

   send = async (topic: string, event: AppEvent): Promise<{ ack: boolean }> => {
      logger.debug(`🔼 Published ${event.eventType} ${event.eventId}`);
      // logger.verbose(JSON.stringify({ topic, event }, null, 2));
      try {
         await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(event) }],
         });

         return { ack: true };
      } catch (error) {
         console.log(error);
         return { ack: false };
      }
   };
}
