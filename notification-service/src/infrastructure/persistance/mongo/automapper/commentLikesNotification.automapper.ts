import { HydratedDocument } from 'mongoose';
import { ICommentLikesNotificationDocument } from '../models/Notification.model.v2';
import { CommentLikesNotification } from '@domain/entities/CommentLikesNotification';

export const commentLikesNotiAutoMapper = (
   doc: HydratedDocument<ICommentLikesNotificationDocument>
): Required<CommentLikesNotification> => {
   const domainCommnetLikesNoti: Required<CommentLikesNotification> = {
      type: doc.type,
      updatedAt: doc.updatedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      id: doc.id ?? String(doc._id),
      isRead: doc.isRead,
      reciverId: doc.reciverId,
      entityId: doc.entityId,
      metadata: {
         postId: doc.metadata.postId,
         likeCount: doc.metadata.likeCount,
         recentLikes: doc.metadata.recentLikes,
      },
      actorId: undefined!,
   };
   return domainCommnetLikesNoti;
};
