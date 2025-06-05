import { Notification } from './Notification.abstract';

export const FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE = 'friend-req.accepted';

export class FriendReqAcceptedNotification implements Partial<Notification> {
   constructor(
      public readonly reciverId: string,
      public readonly actorId: string,
      public readonly entityId: string,
      public readonly metadata: {
         reqStatus: 'ACCEPTED';
      },
      public readonly type: typeof FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE = FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
      public readonly id?: string,
      public readonly isRead?: boolean,
      public readonly createdAt?: String,
      public readonly updatedAt?: string
   ) {}
}
