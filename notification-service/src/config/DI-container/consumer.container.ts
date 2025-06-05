import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';
import {
   friendReqAcceptedNotificationService,
   friendReqNotificationService,
} from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';

export const friendReqEventConsumer = new FriendReqEventConsumer(
   KafkaSingleton.getInstance(),
   friendReqNotificationService,
   friendReqAcceptedNotificationService,
   elasticSearchProxyService
);
