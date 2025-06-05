import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { CombinedNotification } from '@domain/entities/CombinedNotification';
import notificationModel, { friendReqNotificationModel } from '../models/Notification.model.v2';

// TODO: refactor createing frindReqNoti every time with a mapper
export class MongoNotificationRepository implements INotificationRepository {
   constructor() {}

   retriveFriendReq = async (
      friendshipId: string
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOne({ entityId: friendshipId });
      if (!res) return null;

      const friendReqNoti: Required<FriendReqNotification> = {
         id: res.id,
         reciverId: res.reciverId,
         isRead: res.isRead,
         type: 'friend-req',
         actorId: res.actorId,
         entityId: res.entityId,
         metadata: {
            reqStatus: res.metadata.reqStatus,
         },
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };

      return friendReqNoti;
   };
   create = async (friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>> => {
      const res = await friendReqNotificationModel.create({
         reciverId: friendReq.reciverId,
         type: FRIEND_REQ_NOTIFICATION_TYPE,
         entityId: friendReq.entityId,
         actorId: friendReq.actorId,
         metadata: { reqStatus: friendReq.metadata.reqStatus },
      });

      const friendReqNoti: Required<FriendReqNotification> = {
         id: res.id,
         reciverId: res.reciverId,
         isRead: res.isRead,
         type: 'friend-req',
         actorId: res.actorId,
         entityId: res.entityId,
         metadata: {
            reqStatus: res.metadata.reqStatus,
         },
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };

      return friendReqNoti;
   };

   delete = async (friendshipId: string): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOneAndDelete({ entityId: friendshipId });

      if (!res) return null;

      const friendReqNoti: Required<FriendReqNotification> = {
         id: res.id,
         reciverId: res.reciverId,
         isRead: res.isRead,
         type: 'friend-req',
         actorId: res.actorId,
         entityId: res.entityId,
         metadata: {
            reqStatus: res.metadata.reqStatus,
         },
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };

      return friendReqNoti;
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

      const friendReqNoti: Required<FriendReqNotification> = {
         id: res.id,
         reciverId: res.reciverId,
         isRead: res.isRead,
         type: 'friend-req',
         actorId: res.actorId,
         entityId: res.entityId,
         metadata: {
            reqStatus: res.metadata.reqStatus,
         },
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };

      return friendReqNoti;
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
}
