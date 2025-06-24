import { HydratedDocument } from 'mongoose';
import { IFriendRequestAcceptedNotificationDocument } from '../models/Notification.model.v2';
import { FriendReqAcceptedNotification } from '@domain/entities/FriendReqAcceptedNotification.entity';

export const friendReqAcceptedAutoMapper = (
   doc: HydratedDocument<IFriendRequestAcceptedNotificationDocument>
): Required<FriendReqAcceptedNotification> => {
   const domainPostGotNoti: Required<FriendReqAcceptedNotification> = {
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
   return domainPostGotNoti;
};
