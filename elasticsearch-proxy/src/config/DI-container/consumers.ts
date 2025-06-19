import { UserProfileEventsConsumer } from 'consumers/UserProfileEvent.consumer';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { commentServices, postServices, userServices } from './services';
import { PostCreatedEventConsumer } from 'consumers/PostCreatedEvent.consumer';
import { PostDeletedEventConsumer } from 'consumers/PostDeletedEvent.consumer';
import { CommentCreatedEventConsumer } from 'consumers/CommentCreatedEvent.consumer';
import { CommentDeletedEventConsumer } from 'consumers/CommentDeletedEvent.consumer';
import { CommentCreatedEventAggregateConsumer } from 'consumers/CommentCreatedEventAggregator.consumer';

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
   postServices,
   commentServices
);

export const commentCreatedEventConsumer = new CommentCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   commentServices
);

export const commentDeletedEventConsumer = new CommentDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   commentServices
);

export const commentCreatedEventAggreteComsumer = new CommentCreatedEventAggregateConsumer(
   KafkaSingleton.getInstance(),
   postServices
);
