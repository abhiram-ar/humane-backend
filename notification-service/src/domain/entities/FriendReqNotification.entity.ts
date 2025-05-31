import { Notification } from './Notification.abstract';

export const FRIEND_REQ_NOTIFICATION_TYPE = 'friend-req';
export type FriendReqStatus = 'ACCEPTED' | 'PENDING' | 'DECLINED';

export class FriendReqNotification implements Notification {
   public readonly type = FRIEND_REQ_NOTIFICATION_TYPE;
   constructor(
      public readonly id: string,
      public readonly reciverId: string,
      public readonly createdAt: Date,
      public isRead: boolean,
      public readonly updatedAt: Date,
      public readonly friendshipId: string,
      public readonly requesterId: string,
      public status: FriendReqStatus
   ) {}
}
