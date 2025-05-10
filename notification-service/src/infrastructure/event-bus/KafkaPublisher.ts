import { AppEvent } from 'humane-common';
import KafkaSingleton from './KafkaSingleton';
import { Producer } from 'kafkajs';
import { IEventPublisher } from '@ports/IEventProducer';

export class KafkaPublisher implements IEventPublisher {
   producer: Producer;

   constructor(readonly _kafka: KafkaSingleton) {
      this.producer = _kafka.getProducer();
   }

   send = async (topic: string, event: AppEvent): Promise<{ ack: boolean }> => {
      try {
         await this.producer.send({ topic, messages: [{ value: JSON.stringify(event) }] });
         return { ack: true };
      } catch (error) {
         console.error('error while publising event to kafka', error);
         return { ack: false };
      }
   };
}
