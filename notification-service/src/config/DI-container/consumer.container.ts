import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';
import {
   friendReqAcceptedNotificationService,
   friendReqNotificationService,
   postGotCommnetNotificationService,
} from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';
import { CommentCreatedEventConsumer } from '@presentation/event/CommentCreatedEvent.consumer';

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
