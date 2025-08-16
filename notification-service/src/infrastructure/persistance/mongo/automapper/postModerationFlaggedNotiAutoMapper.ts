import { HydratedDocument } from 'mongoose';
import { IPostModerationFlaggedNoficationDocument } from '../models/Notification.model.v2';
import { PostModerationFlaggedNotification } from '@domain/entities/PostModerationFlaggedNotification.entity';

export const postModerationFlaggedNotiAutoMapper = (
   doc: HydratedDocument<IPostModerationFlaggedNoficationDocument>
): Required<PostModerationFlaggedNotification> => {
   const domainPostGotNoti: Required<PostModerationFlaggedNotification> = {
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
