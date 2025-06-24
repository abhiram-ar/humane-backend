import { CombinedNotification } from '@domain/entities/CombinedNotification';
import { FriendReqAcceptedNotification } from '@domain/entities/FriendReqAcceptedNotification.entity';
import {
   FriendReqNotification,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import { PostGotCommentNotification } from '@domain/entities/PostGotCommnetNotification';

export interface INotificationRepository {
   retriveFriendReqNoti(friendshipId: string): Promise<Required<FriendReqNotification> | null>;

   createFriendReqNoti(friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>>;

   deleteFriendReqNoti(friendshipId: string): Promise<Required<FriendReqNotification> | null>;

   updateFriendReqStatus(
      friendshipId: string,
      newStatus: (typeof FriendReqStatus)[keyof typeof FriendReqStatus]
   ): Promise<Required<FriendReqNotification> | null>;

   retriveRecentUserNotifications(
      userId: string,
      limit: number,
      from?: string | null
   ): Promise<{ noti: CombinedNotification[]; from: string | null; hasmore: boolean }>;

   markAsRead(userId: string, fromId: string): Promise<void>;

   retriveFriendReqAcceptedNoti(
      friendshipId: string
   ): Promise<Required<FriendReqAcceptedNotification> | null>;
   createFriendReqAcceptedNoti(
      friendReqAcceptedNoti: FriendReqAcceptedNotification
   ): Promise<Required<FriendReqAcceptedNotification>>;

   deleteFriendReqAcceptedNoti(
      friendshipId: string
   ): Promise<Required<FriendReqAcceptedNotification> | null>;

   createPostGotCommentedNotification(
      noti: PostGotCommentNotification
   ): Promise<Required<PostGotCommentNotification>>;

   deletePostGotCommentNotificationByCommentId(
      commentId: string
   ): Promise<Required<PostGotCommentNotification> | null>;

   deletePostGotCommentNotificationsByPostId(postId: string): Promise<{ deletedCount: number }>;
}
