import { Notification } from './Notification.abstract';

export const POST_GOT_COMMNET_NOTIFICATION_TYPE = 'post-got-comment';
export class PostGotCommentNotification implements Partial<Notification> {
   public readonly type: string = POST_GOT_COMMNET_NOTIFICATION_TYPE;
   public readonly updatedAt?: string;
   public readonly createdAt?: string;
   public id?: string;
   public isRead?: boolean;
   constructor(
      public reciverId: string,
      public actorId: string,
      public entityId: string, // here the entity reffered will be commentId
      public metadata: {
         postId: string;
         commentContent: string; // we can remove depency of ES proxy/writer to read comment contenct on read time, also commnets are immutable in system. So dont want to worry about updating this
      }
   ) {}
}
