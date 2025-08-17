import { HydratedDocument } from 'mongoose';
import { IPostModerationFailedNoficationDocument } from '../models/Notification.model.v2';
import { PostModerationFailedNotification } from '@domain/entities/PostModerationFailedNotification.entity';

export const postModerationFailedNotiAutoMapper = (
   doc: HydratedDocument<IPostModerationFailedNoficationDocument>
): Required<PostModerationFailedNotification> => {
   const domainPostGotNoti: Required<PostModerationFailedNotification> = {
      type: doc.type,
      updatedAt: doc.updatedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      id: doc.id ?? String(doc._id),
      isRead: doc.isRead,
      reciverId: doc.reciverId,
      entityId: doc.entityId,
      metadata: {
         moderationResult: doc.metadata.moderationResult,
      },
   };
   return domainPostGotNoti;
};
