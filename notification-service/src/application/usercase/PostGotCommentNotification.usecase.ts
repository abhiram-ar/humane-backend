import { Comment } from '@application/dtos/Comment.dto';
import {
   POST_GOT_COMMNET_NOTIFICATION_TYPE,
   PostGotCommentNotification,
} from '@domain/entities/PostGotCommnetNotification';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { IPostGotCommentNotificationService } from './interfaces/ICommentNotification.usecase';
import { PostDoesNotExistError } from '@application/Errors/PostDoesNotExistError';

export class PostGotCommentNotificationService implements IPostGotCommentNotificationService {
   constructor(
      private readonly _notificatioRepo: INotificationRepository,
      private readonly _esProxy: IElasticSearchProxyService
   ) {}

   create = async (dto: Comment): Promise<Required<PostGotCommentNotification>> => {
      // get postid authorId

      const postData = await this._esProxy.getPostsDetailsWithoutAuthorDetailsHydration(dto.postId);
      if (!postData || !postData[0]) throw new PostDoesNotExistError(); // invalid postId

      const domainPostGotNoti: PostGotCommentNotification = {
         type: POST_GOT_COMMNET_NOTIFICATION_TYPE,
         reciverId: postData[0].authorId,
         actorId: dto.authorId,
         entityId: dto.id,
         metadata: {
            postId: dto.postId,
            commentContent: dto.content,
         },
      };

      const newNoti = await this._notificatioRepo.createPostGotCommentedNotification(
         domainPostGotNoti
      );

      return newNoti;
   };
}
