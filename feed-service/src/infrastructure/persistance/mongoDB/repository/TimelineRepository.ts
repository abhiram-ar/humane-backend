import { ITimelineRepository } from '@domain/interfaces/ITimelineRepository';
import { TimelinePost } from '@domain/TimelinePost.entity';
import timelineModel from '../models/timelineModel';

export class TimelineRepository implements ITimelineRepository {
   bulkUpsertTimelinePost = async (posts: TimelinePost[]): Promise<void> => {
      const operations: Parameters<typeof timelineModel.bulkWrite>[0] = posts.map((post) => ({
         updateOne: {
            filter: { userId: post.userId, postId: post.postId },
            update: { $set: { authorId: post.authorId } },
            upsert: true,
         },
      }));

      const res = await timelineModel.bulkWrite(operations);

      console.log(res);
   };
   removeAuthorPostsFromTimeline(userId: string, authorId: string): Promise<void> {
      throw new Error('Method not implemented.');
   }
}
