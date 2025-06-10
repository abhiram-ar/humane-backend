import { TimelinePost } from '@domain/TimelinePost.entity';

export interface ITimelineRepository {
   upsertPost(post: TimelinePost): Promise<Required<TimelinePost>>;
   removeAuthorPostsFromTimeline(userId: string, authorId: string): Promise<void>;
}
