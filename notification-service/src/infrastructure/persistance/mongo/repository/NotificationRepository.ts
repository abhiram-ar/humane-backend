import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
} from '@domain/entities/FriendReqNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { friendReqNotificationModel } from '../models/Notification.model';

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
}
