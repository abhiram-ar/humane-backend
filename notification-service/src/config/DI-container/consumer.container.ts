import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';
import {
   commentLikesNotificationService,
   friendReqAcceptedNotificationService,
   friendReqNotificationService,
   postGotCommnetNotificationService,
   postModerationNotificationServices,
} from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';
import { CommentCreatedEventConsumer } from '@presentation/event/CommentCreatedEvent.consumer';
import { CommentDeletedEventConsumer } from '@presentation/event/CommentDeletedEvent.consumer';
import { PostDeletedEventConsumer } from '@presentation/event/PostDeletedEvent.consumer';
import { CommentLikedEventConsumer } from '@presentation/event/CommentLikedEvent.consumer';
import { CommentUnLikedEventConsumer } from '@presentation/event/CommentUnLikedEvent.consumer';
import { UserRewardedEventConsumer } from '@presentation/event/UserRewardedEventConsumer';
import { PostModerationCompletedEventConsumer } from '@presentation/event/PostModerationCompletedEventConsumer';

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
   postGotCommnetNotificationService,
   commentLikesNotificationService
);

export const postDeletedEventConsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   postGotCommnetNotificationService
);

export const commentLikedEventConsumer = new CommentLikedEventConsumer(
   KafkaSingleton.getInstance(),
   commentLikesNotificationService
);

export const commentUnlikedEventConsumer = new CommentUnLikedEventConsumer(
   KafkaSingleton.getInstance(),
   commentLikesNotificationService
);

export const userRewardedEventConsumer = new UserRewardedEventConsumer(
   KafkaSingleton.getInstance()
);

export const postModerationCompleteEventConsumer = new PostModerationCompletedEventConsumer(
   KafkaSingleton.getInstance(),
   postModerationNotificationServices
);
