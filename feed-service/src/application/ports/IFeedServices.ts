import { FeedPostEntity } from '@domain/FeedPost.entity';
import { AppendPostToMultipleUserTimelineInputDTO } from '@dtos/AppendPostToMultipleUserTimeline.dto';

export interface IFeedServices {
   appendPostToMultipleUserFeed(dto: AppendPostToMultipleUserTimelineInputDTO): Promise<void>;
   removeAuthorPostsUserFromFeed(dto: { userId: string; authorId: string }): Promise<void>;
   getUserFeedPaginated(dto: {
      userId: string;
      from: string | null;
      limit: number;
   }): Promise<{
      post: Omit<Required<FeedPostEntity>, 'authorId' | 'userId'>[];
      pagination: { from: string | null; hasMore: boolean };
   }>;
   deletePostFromAllTimeline(postId: string): Promise<void>;
}
  