import { userProfileConsumer } from '@di/consumers';

export const startAllConsumers = async () => {
   await userProfileConsumer.start();
};

export const stopAllConsumer = async () => {
   await userProfileConsumer.stop();
};
