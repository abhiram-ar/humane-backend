import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { CombinedNotification } from '@domain/entities/CombinedNotification';
import notificationModel, {
   friendReqAcceptedNotificationModel,
   friendReqNotificationModel,
   postGotCommnetNotificationModel,
} from '../models/Notification.model.v2';
import {
   FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
   FriendReqAcceptedNotification,
} from '@domain/entities/FriendReqAcceptedNotification.entity';
import {
   POST_GOT_COMMNET_NOTIFICATION_TYPE,
   PostGotCommentNotification,
} from '@domain/entities/PostGotCommnetNotification';
import { postGotCommentNotiAutoMapper } from '../automapper/postGotCommnetNotiAutoMapper';
import { friendReqNotificationAutoMapper } from '../automapper/friendReqNotification.automapper';
import { friendReqAcceptedAutoMapper } from '../automapper/friendReqAcceptedNoti.automapper';

export class MongoNotificationRepository implements INotificationRepository {
   constructor() {}

   retriveFriendReqNoti = async (
      friendshipId: string
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOne({ entityId: friendshipId });
      if (!res) return null;

      return friendReqNotificationAutoMapper(res);
   };
   createFriendReqNoti = async (
      friendReq: FriendReqNotification
   ): Promise<Required<FriendReqNotification>> => {
      const res = await friendReqNotificationModel.create({
         reciverId: friendReq.reciverId,
         type: FRIEND_REQ_NOTIFICATION_TYPE,
         entityId: friendReq.entityId,
         actorId: friendReq.actorId,
         metadata: { reqStatus: friendReq.metadata.reqStatus },
      });

      return friendReqNotificationAutoMapper(res);
   };

   deleteFriendReqNoti = async (
      friendshipId: string
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOneAndDelete({ entityId: friendshipId });

      if (!res) return null;

      return friendReqNotificationAutoMapper(res);
   };

   updateFriendReqStatus = async (
      friendshipId: string,
      newStatus: (typeof FriendReqStatus)[keyof typeof FriendReqStatus]
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOneAndUpdate(
         { entityId: friendshipId },
         { $set: { 'metadata.reqStatus': newStatus } },
         { new: true }
      );

      if (!res) return null;

      return friendReqNotificationAutoMapper(res);
   };

   retriveFriendReqAcceptedNoti = async (
      friendshipId: string
   ): Promise<Required<FriendReqAcceptedNotification> | null> => {
      const res = await friendReqAcceptedNotificationModel.findOne({ entityId: friendshipId });
      if (!res) return null;

      return friendReqAcceptedAutoMapper(res);
   };
   createFriendReqAcceptedNoti = async (
      friendReqAcceptedNoti: FriendReqAcceptedNotification
   ): Promise<Required<FriendReqAcceptedNotification>> => {
      const res = await friendReqAcceptedNotificationModel.create({
         reciverId: friendReqAcceptedNoti.reciverId,
         type: FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
         entityId: friendReqAcceptedNoti.entityId,
         actorId: friendReqAcceptedNoti.actorId,
         metadata: { reqStatus: friendReqAcceptedNoti.metadata.reqStatus },
      });

      return friendReqAcceptedAutoMapper(res);
   };
   deleteFriendReqAcceptedNoti = async (
      friendshipId: string
   ): Promise<Required<FriendReqAcceptedNotification> | null> => {
      const res = await friendReqAcceptedNotificationModel.findOneAndDelete({
         entityId: friendshipId,
      });

      if (!res) return null;

      return friendReqAcceptedAutoMapper(res);
   };

   retriveRecentUserNotifications = async (
      userId: string,
      limit: number,
      from: string | null
   ): Promise<{ noti: CombinedNotification[]; from: string | null; hasmore: boolean }> => {
      const fromFilter = { _id: { $lt: from } };

      const res = await notificationModel
         .find({ reciverId: userId, ...(from && fromFilter) })
         .sort({ _id: -1 }) // some of first character of Id represent unix epoch of document created, so this can effectively used as a cursor
         .limit(limit);

      const notifications: CombinedNotification[] = res.map((doc: any) => ({
         id: doc.id,
         reciverId: doc.reciverId,
         isRead: doc.isRead,
         type: doc.type,
         actorId: doc.actorId,
         entityId: doc.entityId,
         metadata: doc.metadata,
         createdAt: doc.createdAt?.toISOString?.() ?? '',
         updatedAt: doc.updatedAt?.toISOString?.() ?? '',
      }));

      let hasmore = res.length === limit;

      return { noti: notifications, from: hasmore ? res[res.length - 1].id : null, hasmore };
   };

   markAsRead = async (userId: string, fromId: string): Promise<void> => {
      await notificationModel.updateMany(
         { reciverId: userId, _id: { $lte: fromId } },
         { $set: { isRead: true } }
      );
   };

   createPostGotCommentedNotification = async (
      noti: PostGotCommentNotification
   ): Promise<Required<PostGotCommentNotification>> => {
      const res = await postGotCommnetNotificationModel.create({
         reciverId: noti.reciverId,
         type: noti.type,
         actorId: noti.actorId,
         entityId: noti.entityId,
         metadata: { postId: noti.metadata.postId, commentContent: noti.metadata.commentContent },
      });

      return postGotCommentNotiAutoMapper(res);
   };

   deletePostGotCommentNotificationByCommentId = async (
      commentId: string
   ): Promise<Required<PostGotCommentNotification> | null> => {
      const res = await postGotCommnetNotificationModel.findOneAndDelete({
         entityId: commentId,
         type: POST_GOT_COMMNET_NOTIFICATION_TYPE,
      });

      if (!res) return null;
      return postGotCommentNotiAutoMapper(res);
   };

   deletePostGotCommentNotificationsByPostId = async (
      postId: string
   ): Promise<{ deletedCount: number }> => {
      const res = await notificationModel.deleteMany({ 'metadata.postId': postId });
      console.log(res);
      return { deletedCount: res.deletedCount };
   };
}
