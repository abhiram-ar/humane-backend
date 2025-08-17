import {
   commentCreatedEventConsumer,
   commentDeltedEventConsumer,
   commentLikedEventConsumer,
   commentUnlikedEventConsumer,
   friendReqEventConsumer,
   postDeletedEventConsumer,
   postModerationCompleteEventConsumer,
   userRewardedEventConsumer,
} from '@di/consumer.container';

export const startAllConsumers = async () => {
   await friendReqEventConsumer.start();
   await commentCreatedEventConsumer.start();
   await commentDeltedEventConsumer.start();
   await postDeletedEventConsumer.start();
   await commentLikedEventConsumer.start();
   await commentUnlikedEventConsumer.start();
   await userRewardedEventConsumer.start();
   await postModerationCompleteEventConsumer.start();
};

export const stopAllConsumer = () => {
   friendReqEventConsumer.stop();
   commentCreatedEventConsumer.stop();
   commentDeltedEventConsumer.stop();
   postDeletedEventConsumer.stop();
   commentLikedEventConsumer.stop();
   commentUnlikedEventConsumer.stop();
   postModerationCompleteEventConsumer.stop();
};
