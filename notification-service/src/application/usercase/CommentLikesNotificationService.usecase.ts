import { CommnetLikeDTO } from '@application/dtos/CommentLike.dto';
import {
   COMMENT_LIKES_NOTIFICATION_TYPE,
   CommentLikesNotification,
} from '@domain/entities/CommentLikesNotification';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { ICommentLikesNotificationService } from './interfaces/ICommentLikesNotificationService.usecase';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';

export class CommentLikesNotificationService implements ICommentLikesNotificationService {
   constructor(
      private readonly _notificationReposotory: INotificationRepository,
      private readonly _esProxyService: IElasticSearchProxyService
   ) {}

   create = async (
      commnetLike: CommnetLikeDTO
   ): Promise<Required<CommentLikesNotification> | null> => {
      const commentDetails = await this._esProxyService.getCommnetDetailsFromIds(
         commnetLike.commentId
      );
      if (!commentDetails || !commentDetails[0]) return null;

      const newCommentLikesNoti: CommentLikesNotification = {
         type: COMMENT_LIKES_NOTIFICATION_TYPE,
         reciverId: commentDetails[0].authorId,
         entityId: commnetLike.commentId,
         metadata: {
            postId: commentDetails[0].postId,
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
