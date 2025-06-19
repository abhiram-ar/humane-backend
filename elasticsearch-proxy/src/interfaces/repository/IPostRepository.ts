import { IBaseRepository } from './IBaseRepository';
import { IPostDocument } from '../IPostDocument';
import { PostVisibility } from 'humane-common';

export interface IPostRepository extends IBaseRepository<IPostDocument> {
   replace(postId: string, doc: IPostDocument): Promise<void>;

   getUserPosts(
      userId: string,
      from: string | null,
      limit: number,
      filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined
   ): Promise<{ posts: IPostDocument[]; from: string | null; hasMore: boolean }>;

   bulkUpdateCommentsCount(updates: { postId: string; delta: number }[]): Promise<{ ack: boolean }>;
}
