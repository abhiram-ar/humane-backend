import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import notificationModel, { friendReqNotificationModel } from '../models/Notification.model';
import { CombinedNotification } from '@domain/entities/CombinedNotification';

// TODO: refactor createing frindReqNoti every time with a mapper
export class MongoNotificationRepository implements INotificationRepository {
   constructor() {}

   retriveFriendReq = async (
      friendshipId: string
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOne({ friendshipId: friendshipId });
      if (!res) return null;

      const friendReqNoti: Required<FriendReqNotification> = {
         type: res.type,
         id: res.id,
         isRead: res.isRead,
         updatedAt: res.updatedAt.toISOString(),
         friendshipId: res.friendshipId,
         reciverId: res.reciverId,
         requesterId: res.requesterId,
         createdAt: res.createdAt.toISOString(),
         status: res.status,
      };

      return friendReqNoti;
   };
   create = async (friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>> => {
      const res = await friendReqNotificationModel.create({
         reciverId: friendReq.reciverId,
         type: FRIEND_REQ_NOTIFICATION_TYPE,
         friendshipId: friendReq.friendshipId,
         requesterId: friendReq.requesterId,
         status: friendReq.status,
      });

      const friendReqNoti: Required<FriendReqNotification> = {
         type: res.type,
         id: res.id,
         isRead: res.isRead,
         updatedAt: res.updatedAt.toISOString(),
         friendshipId: res.friendshipId,
         reciverId: res.reciverId,
         requesterId: res.requesterId,
         createdAt: res.createdAt.toISOString(),
         status: res.status,
      };

      return friendReqNoti;
   };

   delete = async (friendshipId: string): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOneAndDelete({ friendshipId: friendshipId });

      if (!res) return null;

      const friendReqNoti: Required<FriendReqNotification> = {
         type: res.type,
         id: res.id,
         isRead: res.isRead,
         updatedAt: res.updatedAt.toISOString(),
         friendshipId: res.friendshipId,
         reciverId: res.reciverId,
         requesterId: res.requesterId,
         createdAt: res.createdAt.toISOString(),
         status: res.status,
      };

      return friendReqNoti;
   };

   updateFriendReqStatus = async (
      friendshipId: string,
      newStatus: FriendReqStatus
   ): Promise<Required<FriendReqNotification> | null> => {
      const res = await friendReqNotificationModel.findOneAndUpdate(
         { friendshipId: friendshipId },
         { status: newStatus },
         { new: true }
      );

      if (!res) return null;

      const friendReqNoti: Required<FriendReqNotification> = {
         type: res.type,
         id: res.id,
         isRead: res.isRead,
         updatedAt: res.updatedAt.toISOString(),
         friendshipId: res.friendshipId,
         reciverId: res.reciverId,
         requesterId: res.requesterId,
         createdAt: res.createdAt.toISOString(),
         status: res.status,
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

      // Map MongoDB documents to CombinedNotification objects
      const notifications: CombinedNotification[] = res.map((doc: any) => ({
         id: doc.id,
         type: doc.type,
         isRead: doc.isRead,
         updatedAt: doc.updatedAt.toISOString?.() ?? '',
         createdAt: doc.createdAt.toISOString?.() ?? '',
         reciverId: doc.reciverId,
         //
         friendshipId: doc.friendshipId,
         requesterId: doc.requesterId,
         status: doc.status,
         // Add any other fields needed for CombinedNotification
      }));

      let hasmore = res.length === limit;

      return { noti: notifications, from: hasmore ? res[res.length - 1].id : null, hasmore };
   };

   markAsRead = async (userId: string, fromId: string): Promise<void> => {
      const res = await notificationModel.updateMany(
         { reciverId: userId, _id: { $lte: fromId } },
         { $set: { isRead: true } }
      );

      console.log(res);
   };
}
