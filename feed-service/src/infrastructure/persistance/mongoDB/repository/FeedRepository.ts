import { IFeedRepository } from '@domain/interfaces/IFeedRepository';
import { FeedPostEntity } from '@domain/FeedPost.entity';
import feedModel from '../models/feedModel';

export class FeedRepository implements IFeedRepository {
   bulkUpsertTimelinePost = async (posts: FeedPostEntity[]): Promise<void> => {
      const operations: Parameters<typeof feedModel.bulkWrite>[0] = posts.map((post) => ({
         updateOne: {
            filter: { userId: post.userId, postId: post.postId },
            update: { $set: { authorId: post.authorId, createdAt: post.createdAt } },
            upsert: true,
         },
      }));

      const res = await feedModel.bulkWrite(operations);

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
      post: Omit<Required<FeedPostEntity>, 'authorId' | 'userId'>[];
      from: string | null;
      hasMore: boolean;
   }> => {
      const res = await feedModel
         .find({ userId, ...(from && { _id: { $lt: from } }) }, { postId: 1, createdAt: 1 })
         .sort({ _id: -1 })
         .limit(limit);

      const parsedTimelinePosts = res.map((doc) => ({
         id: doc.id,
         postId: doc.postId,
         createdAt: doc.createdAt,
      }));

      const hasMore = res.length === limit;

      return { post: parsedTimelinePosts, from: hasMore ? res[res.length - 1].id : null, hasMore };
   };
}
