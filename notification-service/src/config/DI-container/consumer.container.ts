import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';
import {
   friendReqAcceptedNotificationService,
   friendReqNotificationService,
   postGotCommnetNotificationService,
} from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';
import { CommentCreatedEventConsumer } from '@presentation/event/CommentCreatedEvent.consumer';
import { CommentDeletedEventConsumer } from '@presentation/event/CommentDeletedEvent.consumer';
import { PostDeletedEventConsumer } from '@presentation/event/PostDeletedEvent.consumer';

export const friendReqEventConsumer = new FriendReqEventConsumer(
   KafkaSingleton.getInstance(),
   friendReqNotificationService,
   friendReqAcceptedNotificationService,
   elasticSearchProxyService
);

export const commentCreatedEventConsumer = new CommentCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   postGotCommnetNotificationService,
   elasticSearchProxyService
);

export const commentDeltedEventConsumer = new CommentDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   postGotCommnetNotificationService
);

export const postDeletedEventConsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   postGotCommnetNotificationService
);
