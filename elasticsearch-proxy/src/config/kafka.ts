import {
   commentCreatedEventAggreteComsumer,
   commentCreatedEventConsumer,
   commentDeletedEventAggreateConsumer,
   commentDeletedEventConsumer,
   postCreatedEventConsumer,
   postDeletedEventConsumer,
   rewardEventsAggregatorConsumer,
   userProfileConsumer,
} from '@di/consumers';

const consumers = [
   userProfileConsumer,
   postCreatedEventConsumer,
   postDeletedEventConsumer,
   commentCreatedEventConsumer,
   commentDeletedEventConsumer,
   commentCreatedEventAggreteComsumer,
   commentDeletedEventAggreateConsumer,
   rewardEventsAggregatorConsumer,
];
export const startAllConsumers = async () => {
   await userProfileConsumer.start();
   await postCreatedEventConsumer.start();
   await postDeletedEventConsumer.start();
   await commentCreatedEventConsumer.start();
   await commentDeletedEventConsumer.start();
   await commentCreatedEventAggreteComsumer.start();
   await commentDeletedEventAggreateConsumer.start();
   await rewardEventsAggregatorConsumer.start();
};

export const stopAllConsumer = async () => {
   await userProfileConsumer.stop();
   await postCreatedEventConsumer.stop();
   await postDeletedEventConsumer.stop();
   await commentCreatedEventConsumer.stop();
   await commentDeletedEventConsumer.stop();
   await commentCreatedEventAggreteComsumer.stop();
   await commentDeletedEventAggreateConsumer.stop();
   await rewardEventsAggregatorConsumer.stop();
};
