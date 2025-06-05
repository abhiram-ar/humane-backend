import { CombinedNotification } from '@domain/entities/CombinedNotification';
import {
   FriendReqNotification,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';

export interface INotificationRepository {
   retriveFriendReq(friendshipId: string): Promise<Required<FriendReqNotification> | null>;

   create(friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>>;

   delete(friendshipId: string): Promise<Required<FriendReqNotification> | null>;

   updateFriendReqStatus(
      friendshipId: string,
      newStatus: FriendReqStatus
   ): Promise<Required<FriendReqNotification> | null>;

   retriveRecentUserNotifications(
      userId: string,
      limit: number,
      from?: string | null
   ): Promise<{ noti: CombinedNotification[]; from: string | null; hasmore: boolean }>;

   markAsRead(userId: string, fromId: string): Promise<void>;
}
