import { Comment } from '@application/dtos/Comment.dto';
import {
   POST_GOT_COMMNET_NOTIFICATION_TYPE,
   PostGotCommentNotification,
} from '@domain/entities/PostGotCommnetNotification';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { IPostGotCommentNotificationService } from './interfaces/IPostGotCommentNotification.usecase';
import { PostDoesNotExistError } from '@application/Errors/PostDoesNotExistError';
import { logger } from '@config/logger';

export class PostGotCommentNotificationService implements IPostGotCommentNotificationService {
   constructor(
      private readonly _notificatioRepo: INotificationRepository,
      private readonly _esProxy: IElasticSearchProxyService
   ) {}

   create = async (commentDTO: Comment): Promise<Required<PostGotCommentNotification> | void> => {
      // get postid authorId

      const postData = await this._esProxy.getPostsDetailsWithoutAuthorDetailsHydration(
         commentDTO.postId
      );
      if (!postData || !postData[0]) throw new PostDoesNotExistError(); // invalid postId

      if (postData[0].authorId === commentDTO.authorId) return; // dont want to create a notification if the postAutor itself commneted

      const domainPostGotNoti: PostGotCommentNotification = {
         type: POST_GOT_COMMNET_NOTIFICATION_TYPE,
         reciverId: postData[0].authorId,
         actorId: commentDTO.authorId,
         entityId: commentDTO.id,
         metadata: {
            postId: commentDTO.postId,
            commentContent: commentDTO.content,
         },
      };

      const newNoti = await this._notificatioRepo.createPostGotCommentedNotification(
         domainPostGotNoti
      );

      return newNoti;
   };
   deleteNotificationByCommentId = async (
      commentId: string
   ): Promise<Required<PostGotCommentNotification> | null> => {
      const res = await this._notificatioRepo.deletePostGotCommentNotificationByCommentId(
         commentId
      );
      if (res) logger.debug(`delted ${res.id} comment from notification`);
      return res;
   };
}
