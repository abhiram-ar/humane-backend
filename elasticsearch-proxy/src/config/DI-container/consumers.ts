import { UserProfileEventsConsumer } from 'consumers/UserProfileEvent.consumer';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { commentServices, postServices, userServices } from './services';
import { PostCreatedEventConsumer } from 'consumers/PostCreatedEvent.consumer';
import { PostDeletedEventConsumer } from 'consumers/PostDeletedEvent.consumer';
import { CommentCreatedEventConsumer } from 'consumers/CommentCreatedEvent.consumer';

export const userProfileConsumer = new UserProfileEventsConsumer(
   KafkaSingleton.getInstance(),
   userServices
);

export const postCreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   postServices
);

export const postDeletedEventConsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   postServices
);

export const commentCreatedEventConsumer = new CommentCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   commentServices
);
