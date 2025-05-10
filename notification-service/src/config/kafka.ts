import { userPasswordRecoveryRequestEventConsumer } from '@DI-container/consumers/sendEmailConsumer.container';
import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   console.log('kafka producer connected');
}

export const disconnectKafkaProducer = async () => {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   console.log('kafka producer disconnected');
};

export const startAllConsumers = async () => {
   await userPasswordRecoveryRequestEventConsumer.start();
};

export const stopAllConsumers = async () => {
   await userPasswordRecoveryRequestEventConsumer.stop();
};
