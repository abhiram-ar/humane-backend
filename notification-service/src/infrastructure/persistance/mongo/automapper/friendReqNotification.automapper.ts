import { HydratedDocument } from 'mongoose';
import { IFriendRequestNotificationDocument } from '../models/Notification.model.v2';
import { FriendReqNotification } from '@domain/entities/FriendReqNotification.entity';

export const friendReqNotificationAutoMapper = (
   doc: HydratedDocument<IFriendRequestNotificationDocument>
): Required<FriendReqNotification> => {
   const domainFriendReqNoti: Required<FriendReqNotification> = {
      reciverId: doc.reciverId,
      actorId: doc.actorId,
      entityId: doc.entityId,
      metadata: {
         reqStatus: doc.metadata.reqStatus,
      },
      type: doc.type,
      id: doc.id ?? String(doc._id),
      isRead: doc.isRead,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
   };
   return domainFriendReqNoti;
};
