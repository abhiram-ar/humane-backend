import { HydratedDocument } from 'mongoose';
import { IPostGotCommnetNotificationDocument } from '../models/Notification.model.v2';
import { PostGotCommentNotification } from '@domain/entities/PostGotCommnetNotification';

export const postGotCommentNotiAutoMapper = (
   doc: HydratedDocument<IPostGotCommnetNotificationDocument>
): Required<PostGotCommentNotification> => {
   const domainPostGotNoti: Required<PostGotCommentNotification> = {
      type: doc.type,
      updatedAt: doc.updatedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      id: doc.id ?? String(doc._id),
      isRead: doc.isRead,
      reciverId: doc.reciverId,
      actorId: doc.actorId,
      entityId: doc.entityId,
      metadata: {
         postId: doc.metadata.postId,
         commentContent: doc.metadata.commentContent,
      },
   };
   return domainPostGotNoti;
};
