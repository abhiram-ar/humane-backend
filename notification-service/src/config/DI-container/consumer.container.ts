import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { FriendReqEventConsumer } from '@presentation/event/FriendreqEventConsumer';

export const friendReqEventConsumer = new FriendReqEventConsumer(KafkaSingleton.getInstance());
