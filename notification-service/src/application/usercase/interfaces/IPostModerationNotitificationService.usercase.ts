import { PostInputDTO } from '@application/dtos/Post.dto';
import { PostModerationFailedNotification } from '@domain/entities/PostModerationFailedNotification.entity';
import { PostModerationFlaggedNotification } from '@domain/entities/PostModerationFlaggedNotification.entity';

export interface IPostModerationNotificationService {
   create(
      post: PostInputDTO
   ): Promise<
      | Required<PostModerationFlaggedNotification>
      | Required<PostModerationFailedNotification>
      | null
   >;
}
