import { Kafka, Producer } from 'kafkajs';

class KafkaSingleton {
   private static instance: KafkaSingleton;
   private kafka: Kafka;
   private producer: Producer | null = null;

   // private constructor prevents direct initialization, \
   // esures single instance throughout the app
   private constructor() {
      this.kafka = new Kafka({
         clientId: 'humane-notification-service',
         brokers: ['kafka:9092'],
      });
   }
}
