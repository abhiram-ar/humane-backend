import { FeedPostEntity } from '@domain/FeedPost.entity';

export interface IFeedRepository {
   bulkUpsertTimelinePost(posts: FeedPostEntity[]): Promise<void>;
   removeAuthorPostsFromUserTimeline(userId: string, authorId: string): Promise<void>;

   getUserTimeline(
      userId: string,
      from: string | null,
      limit: number
   ): Promise<{
      post: Omit<FeedPostEntity, 'authorId' | 'userId'>[];
      from: string | null;
      hasMore: boolean;
   }>;
}
