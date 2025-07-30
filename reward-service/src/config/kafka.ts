import {
   chatMessageSpecialEventsConsumer,
   postAuthorLikedCommentEventConsumer,
} from '@di/consumer.container';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   console.log('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   console.log('kafka producer disconnected');
}

const consumers = [postAuthorLikedCommentEventConsumer, chatMessageSpecialEventsConsumer];

export const startAllConsumer = async () => {
   const promises = consumers.map(async (consumer) => {
      await consumer.start();
   });
   await Promise.all(promises);
};

export const stopAllConsumer = async () => {
   const promises = consumers.map(async (consumer) => {
      await consumer.stop();
   });
   await Promise.all(promises);
};
