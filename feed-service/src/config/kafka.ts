import { postcreatedEventConsumer } from '@di/consumers.container';

export const startAllConsumers = async () => {
   await postcreatedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await postcreatedEventConsumer.stop();
};
