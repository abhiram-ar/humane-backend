import { TimelinePost } from '@domain/TimelinePost.entity';

export interface ITimelineRepository {
   bulkUpsertTimelinePost(posts: TimelinePost[]): Promise<void>;
   removeAuthorPostsFromUserTimeline(userId: string, authorId: string): Promise<void>;

   getUserTimeline(
      userId: string,
      from: string | null,
      limit: number
   ): Promise<{
      post: Pick<TimelinePost, 'postId' | 'createdAt'>[];
      from: string | null;
      hasMore: boolean;
   }>;
}
