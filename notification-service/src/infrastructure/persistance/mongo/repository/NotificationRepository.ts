import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';
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
   create(friendReq: FriendReqNotification): Promise<Required<FriendReqNotification>> {
      throw new Error('Method not implemented.');
   }
}
