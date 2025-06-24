import { Comment } from '@application/dtos/Comment.dto';
import { PostGotCommentNotification } from '@domain/entities/PostGotCommnetNotification';

export interface IPostGotCommentNotificationService {
   create(dto: Comment): Promise<Required<PostGotCommentNotification> | void>;

   deleteNotificationByCommentId(
      commentId: string
   ): Promise<Required<PostGotCommentNotification> | null>;

   deleteNotificationsByPostId(postId: string): Promise<{ deletedCount: number }>;
}
