import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { logger } from './logget';
import {
   commentLikeCountWorker,
   commentLikedByPostAuthorWorker,
   commentLikeWorker,
   commentUnlikedWorker,
   commnetUnLikedByPostAuthorWorker,
   postModeratedEventConsumer,
} from '@di/consumer.container';

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
   await commentUnlikedWorker.start();
   await commentLikedByPostAuthorWorker.start();
   await commnetUnLikedByPostAuthorWorker.start();
   await postModeratedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await commentLikeWorker.stop();
   await commentLikeCountWorker.stop();
   await commentUnlikedWorker.stop();
   await commentLikedByPostAuthorWorker.stop();
   await commnetUnLikedByPostAuthorWorker.stop();
   await postModeratedEventConsumer.stop();
};
