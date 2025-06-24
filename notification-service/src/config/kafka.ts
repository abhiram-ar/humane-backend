import {
   commentCreatedEventConsumer,
   commentDeltedEventConsumer,
   friendReqEventConsumer,
} from '@di/consumer.container';

export const startAllConsumers = async () => {
   await friendReqEventConsumer.start();
   await commentCreatedEventConsumer.start();
   await commentDeltedEventConsumer.start();
};

export const stopAllConsumer = async () => {
   await friendReqEventConsumer.stop();
   await commentCreatedEventConsumer.stop();
   await commentDeltedEventConsumer.stop();
};
