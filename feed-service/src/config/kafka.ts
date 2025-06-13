import { postcreatedEventConsumer, postDeletedEventComsumer } from '@di/consumers.container';

export const startAllConsumers = async () => {
   await postcreatedEventConsumer.start();
   await postDeletedEventComsumer.start();
};

export const stopAllConsumer = async () => {
   await postcreatedEventConsumer.stop();
   await postDeletedEventComsumer.stop();
};
