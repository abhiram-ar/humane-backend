import { CommnetLikeDTO } from '@application/dtos/CommentLike.dto';
import {
   COMMENT_LIKES_NOTIFICATION_TYPE,
   CommentLikesNotification,
} from '@domain/entities/CommentLikesNotification';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { ICommentLikesNotificationService } from './interfaces/ICommentLikesNotificationService.usecase';

export class CommentLikesNotificationService implements ICommentLikesNotificationService {
   constructor(private readonly _notificationReposotory: INotificationRepository) {}

   create = async (
      commnetLike: CommnetLikeDTO
   ): Promise<Required<CommentLikesNotification> | null> => {
      const newCommentLikesNoti: CommentLikesNotification = {
         type: COMMENT_LIKES_NOTIFICATION_TYPE,
         reciverId: 'commenterId',
         entityId: commnetLike.commentId,
         metadata: {
            postId: 'postId',
            recentLikes: [],
         },
      };

      const res = await this._notificationReposotory.upsertCommentLikesNotification(
         commnetLike,
         newCommentLikesNoti
      );

      return res;
   };
}
