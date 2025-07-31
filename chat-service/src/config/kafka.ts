import { repliedWithinResonableTimeWorkerConsumer } from '@di/consumers.container';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { logger } from './logger';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   logger.info('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   logger.debug('kafka producer disconnected');
}

export const startAllConsumer = async () => {
   await repliedWithinResonableTimeWorkerConsumer.start();
};

export const stopAllConsumer = () => {
   repliedWithinResonableTimeWorkerConsumer.stop();
};
