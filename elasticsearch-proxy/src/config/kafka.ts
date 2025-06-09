import { postCreatedEventConsumer, userProfileConsumer } from '@di/consumers';

export const startAllConsumers = async () => {
   await userProfileConsumer.start();
   await postCreatedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await userProfileConsumer.stop();
   await postCreatedEventConsumer.stop();
};
