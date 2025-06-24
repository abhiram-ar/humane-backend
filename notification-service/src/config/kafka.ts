import {
   commentCreatedEventConsumer,
   commentDeltedEventConsumer,
   friendReqEventConsumer,
   postDeletedEventConsumer,
} from '@di/consumer.container';

export const startAllConsumers = async () => {
   await friendReqEventConsumer.start();
   await commentCreatedEventConsumer.start();
   await commentDeltedEventConsumer.start();
   await postDeletedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await friendReqEventConsumer.stop();
   await commentCreatedEventConsumer.stop();
   await commentDeltedEventConsumer.stop();
   await postDeletedEventConsumer.stop();
};
