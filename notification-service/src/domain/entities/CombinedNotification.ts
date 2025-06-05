import {
   FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
   FriendReqAcceptedNotification,
} from './FriendReqAcceptedNotification.entity';
import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
} from './FriendReqNotification.entity';

export const CombinedNotificationType = {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
} as const;
export type CombinedNotification = FriendReqNotification | FriendReqAcceptedNotification;
