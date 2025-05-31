import { friendReqEventConsumer } from '@di/consumer.container';

export const startAllConsumers = async () => {
   await friendReqEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await friendReqEventConsumer.stop();
};
