import { commentCreatedEventConsumer, friendReqEventConsumer } from '@di/consumer.container';

export const startAllConsumers = async () => {
   await friendReqEventConsumer.start();
   await commentCreatedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await friendReqEventConsumer.stop();
   await commentCreatedEventConsumer.stop();
};
