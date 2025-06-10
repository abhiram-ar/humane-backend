import { ITimelineRepository } from '@domain/interfaces/ITimelineRepository';
import { TimelinePost } from '@domain/TimelinePost.entity';
import timelineModel from '../models/timelineModel';

export class TimelineRepository implements ITimelineRepository {
   bulkUpsertTimelinePost = async (posts: TimelinePost[]): Promise<void> => {
      const operations: Parameters<typeof timelineModel.bulkWrite>[0] = posts.map((post) => ({
         updateOne: {
            filter: { userId: post.userId, postId: post.postId },
            update: { $set: { authorId: post.authorId, createdAt: post.createdAt } },
            upsert: true,
         },
      }));

      const res = await timelineModel.bulkWrite(operations);

      console.log(res);
   };
   removeAuthorPostsFromUserTimeline(userId: string, authorId: string): Promise<void> {
      throw new Error('Method not implemented.');
   }

   getUserTimeline = async (
      userId: string,
      from: string | null,
      limit: number
   ): Promise<{
      post: Pick<TimelinePost, 'postId' | 'createdAt'>[];
      from: string | null;
      hasMore: boolean;
   }> => {
      const res = await timelineModel
         .find({ userId, ...(from && { _id: { $lt: from } }) }, { postId: 1, createdAt: 1 })
         .sort({ _id: -1 })
         .limit(limit);

      const parsedTimelinePosts = res.map((doc) => ({
         postId: doc.postId,
         createdAt: doc.createdAt,
      }));

      const hasMore = res.length === limit;

      return { post: parsedTimelinePosts, from: hasMore ? res[res.length - 1].id : null, hasMore };
   };
}
