import { PostInputDTO } from '@application/dtos/Post.dto';
import { logger } from '@config/logger';
import { PostModerationFailedNotification } from '@domain/entities/PostModerationFailedNotification.entity';
import { PostModerationFlaggedNotification } from '@domain/entities/PostModerationFlaggedNotification.entity';
import { INotificationRepository } from '@domain/interfaces/repository/INotificationRepository';

export class PostModerationNotificationService {
   constructor(private readonly _notiRepo: INotificationRepository) {}

   create = async (
      post: PostInputDTO
   ): Promise<
      | Required<PostModerationFlaggedNotification>
      | Required<PostModerationFailedNotification>
      | null
   > => {
      if (post.moderationStatus === 'ok' || post.moderationStatus === 'pending') return null;
      if (post.moderationStatus === 'failed') {
         const noti = new PostModerationFailedNotification(post.authorId, post.id, {
            moderationResult: post.moderationMetadata,
         });
         return await this._notiRepo.createPostModerationFailedNotification(noti);
      }

      if (post.moderationStatus === 'notAppropriate') {
         const noti = new PostModerationFlaggedNotification(post.authorId, post.id, {
            moderationResult: post.moderationMetadata,
         });
         return await this._notiRepo.createPostModerationFlaggedNotification(noti);
      }
      logger.warn('moderation status invalid or non existant');
      return null;
   };
}
