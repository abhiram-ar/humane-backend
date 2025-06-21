import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { logger } from './logget';
import { commentLikeCountWorker, commentLikeWorker } from '@di/consumer.container';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   logger.info('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   logger.info('kafka producer disconnected');
}

export const startAllConsumer = async () => {
   await commentLikeWorker.start();
   await commentLikeCountWorker.start();
};

export const stopAllConsumer = async () => {
   await commentLikeWorker.stop();
   await commentLikeCountWorker.stop();
};
