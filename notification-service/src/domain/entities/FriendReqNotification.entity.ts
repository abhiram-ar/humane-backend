import { Notification } from './Notification.abstract';

export const FRIEND_REQ_NOTIFICATION_TYPE = 'friend-req';
export type FriendReqStatus = 'ACCEPTED' | 'PENDING' | 'DECLINED';

export class FriendReqNotification implements Notification {
   public readonly type = FRIEND_REQ_NOTIFICATION_TYPE;
   public readonly id: string | undefined;
   public isRead: boolean | undefined;
   public readonly updatedAt: string | undefined;
   constructor(
      public readonly friendshipId: string,
      public readonly reciverId: string,
      public readonly requesterId: string,
      public readonly createdAt: string,
      public status: FriendReqStatus
   ) {}
}
