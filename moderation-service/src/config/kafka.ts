import { postCreatedEventConsumer } from '@di/consumers.container';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';

export async function connectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().connect();
   console.log('kafka producer connected');
}

export async function disconnectKafkaProducer() {
   await KafkaSingleton.getInstance().getProducer().disconnect();
   console.log('kafka producer disconnected');
}

export const startAllConsumers = async () => {
   await postCreatedEventConsumer.start();
};

export const stopAllConsumers = () => {
   postCreatedEventConsumer.stop();
};
