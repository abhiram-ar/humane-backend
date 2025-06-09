import { UserProfileEventsConsumer } from 'consumers/UserProfileEvent.consumer';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { postServices, userServices } from './services';
import { PostCreatedEventConsumer } from 'consumers/PostCreatedEvent.consumer';

export const userProfileConsumer = new UserProfileEventsConsumer(
   KafkaSingleton.getInstance(),
   userServices
);

export const postCreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   postServices
);
