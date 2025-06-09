import {
   commentCreatedEventConsumer,
   postCreatedEventConsumer,
   postDeletedEventConsumer,
   userProfileConsumer,
} from '@di/consumers';

export const startAllConsumers = async () => {
   await userProfileConsumer.start();
   await postCreatedEventConsumer.start();
   await postDeletedEventConsumer.start();
   await commentCreatedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await userProfileConsumer.stop();
   await postCreatedEventConsumer.stop();
   await postDeletedEventConsumer.stop();
   await commentCreatedEventConsumer.stop();
};
