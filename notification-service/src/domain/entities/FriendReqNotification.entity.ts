import { Notification } from './Notification.abstract';

export const FRIEND_REQ_NOTIFICATION_TYPE = 'friend-req';
export const FriendReqStatus = {
   ACCEPTED: 'ACCEPTED',
   PENDING: 'PENDING',
   DECLINED: 'DECLINED',
} as const;

export class FriendReqNotification implements Partial<Notification> {
   constructor(
      public readonly reciverId: string,
      public readonly actorId: string,
      public readonly entityId: string,
      public readonly metadata: {
         reqStatus: (typeof FriendReqStatus)[keyof typeof FriendReqStatus];
      },
      //
      public readonly type: typeof FRIEND_REQ_NOTIFICATION_TYPE = FRIEND_REQ_NOTIFICATION_TYPE,
      public readonly id?: string,
      public readonly isRead?: boolean,
      public readonly createdAt?: string,
      public readonly updatedAt?: string
   ) {}
}
