import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { logger } from './logget';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   logger.info('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   logger.info('kafka producer disconnected');
}
