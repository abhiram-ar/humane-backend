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
      let cursorFilter = {};
      if (from) {
         const [createdAtStr, postId] = from.split('|');
         const createdAt = new Date(Number(createdAtStr));
         cursorFilter = {
            $or: [
               { createdAt: { $lt: createdAt } },
               { createdAt: createdAt, postId: { $lt: postId } },
            ],
         };
      }

      const res = await feedModel
         .find({ userId, ...cursorFilter }, { postId: 1, createdAt: 1 })
         .sort({ createdAt: -1, postId: -1 })
         .limit(limit);

      const parsedTimelinePosts = res.map((doc) => ({
         id: doc.id,
         postId: doc.postId,
         createdAt: doc.createdAt,
      }));

      const hasMore = res.length === limit;
      const cursor =
         hasMore && res.length > 0
            ? `${res[res.length - 1].createdAt.getTime()}|${res[res.length - 1].postId}`
            : null;

      return { post: parsedTimelinePosts, from: cursor, hasMore };
   };

   deletePostFromAllTimeline = async (postId: string): Promise<{ deletedCount: number }> => {
      const res = await feedModel.deleteMany({ postId });
      return { deletedCount: res.deletedCount };
   };
}
