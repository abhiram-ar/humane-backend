import { Notification } from './Notification.abstract';

export const POST_MODERATION_FLAGGED_TYPE = 'post-moderation-flagged';
export class PostModerationFlaggedNotification implements Partial<Notification> {
   public readonly type: string = POST_MODERATION_FLAGGED_TYPE;
   public readonly updatedAt?: string;
   public readonly createdAt?: string;
   public id?: string;
   public isRead?: boolean;
   constructor(
      public reciverId: string,
      public entityId: string, // here the entity reffered will be postId
      public metadata: {
         moderationResult: any;
      }
   ) {}
}
