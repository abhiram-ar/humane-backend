import { TimelinePost } from '@domain/TimelinePost.entity';

export interface ITimelineRepository {
   bulkUpsertTimelinePost(posts: TimelinePost[]): Promise<void>;
   removeAuthorPostsFromTimeline(userId: string, authorId: string): Promise<void>;
}
