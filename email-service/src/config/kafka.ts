import {
   userPasswordRecoveryRequestEventConsumer,
   useSignupEventConsumer,
} from '@DI-container/consumers/sendEmailConsumer.container';
import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';
import { logger } from './logger';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   logger.info('kafka producer connected');
}

export const disconnectKafkaProducer = async () => {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   logger.info('kafka producer disconnected');
};

export const startAllConsumers = async () => {
   await userPasswordRecoveryRequestEventConsumer.start();
   await useSignupEventConsumer.start();
};

export const stopAllConsumers = async () => {
   await userPasswordRecoveryRequestEventConsumer.stop();
   await useSignupEventConsumer.stop();
};
