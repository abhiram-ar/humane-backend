import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';
import { friendReqNotificationService } from './usecases/friendReqNotification.container';

export const friendReqEventConsumer = new FriendReqEventConsumer(
   KafkaSingleton.getInstance(),
   friendReqNotificationService
);
