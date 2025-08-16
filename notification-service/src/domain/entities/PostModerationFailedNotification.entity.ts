import { Notification } from './Notification.abstract';

export const POST_MODERATION_FAILED_TYPE = 'post-moderation-failed';
export class PostModerationFailedNotification implements Partial<Notification> {
   public readonly type: string = POST_MODERATION_FAILED_TYPE;
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
