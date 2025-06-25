import { Notification } from './Notification.abstract';

export const COMMENT_LIKES_NOTIFICATION_TYPE = 'comment-likes';
export class CommentLikesNotification implements Partial<Notification> {
   public readonly type: string = COMMENT_LIKES_NOTIFICATION_TYPE;
   public readonly updatedAt?: string;
   public readonly createdAt?: string;
   public id?: string;
   public isRead?: boolean;
   constructor(
      public reciverId: string,
      public entityId: string, // here the entity reffered will be commentId
      public metadata: {
         postId: string;
         likeCount?: number;
         recentLikes: { userId: string; likeId: string }[]; // userId data will be fetched by frontend as FFB or BE sync req
      }
   ) {}
}
