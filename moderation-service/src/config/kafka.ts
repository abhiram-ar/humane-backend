import { postCreatedEventConsumer } from '@di/consumers.container';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { logger } from './logger';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   logger.info('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   logger.info('kafka producer disconnected');
}

export const startAllKafkaConsumers = async () => {
   await postCreatedEventConsumer.start();
};

export const stopAllKafkaConsumers = () => {
   postCreatedEventConsumer.stop();
};
