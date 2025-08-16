import { postModerationCompletedEventConsumer, postDeletedEventComsumer } from '@di/consumers.container';

export const startAllConsumers = async () => {
   await postModerationCompletedEventConsumer.start();
   await postDeletedEventComsumer.start();
};

export const stopAllConsumer = async () => {
   await postModerationCompletedEventConsumer.stop();
   await postDeletedEventComsumer.stop();
};
