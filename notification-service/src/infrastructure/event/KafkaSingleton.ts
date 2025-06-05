import { ENV } from '@config/env';
import { Consumer, Kafka, Producer } from 'kafkajs';

class KafkaSingleton {
   private static _instance: KafkaSingleton;
   private _kafka: Kafka;
   private _producer: Producer | null = null;

   // private constructor prevents direct initialization,
   // esures single instance throughout the app
   private constructor() {
      this._kafka = new Kafka({
         clientId: ENV.KAFKA_CLIENT_ID,
         brokers: [ENV.KAFKA_BROKER_URI as string],
      });
   }

   public static getInstance(): KafkaSingleton {
      if (!KafkaSingleton._instance) {
         KafkaSingleton._instance = new KafkaSingleton();
      }
      return KafkaSingleton._instance;
   }

   public getProducer(): Producer {
      if (!this._producer) {
         this._producer = this._kafka.producer();
      }
      return this._producer;
   }

   public createConsumer(groupId: string): Consumer {
      return this._kafka.consumer({ groupId });
   }
}

export default KafkaSingleton;
