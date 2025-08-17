import { IBaseRepository } from './IBaseRepository';
import { IPostDocument } from '../IPostDocument';
import { ModerationStatus, PostVisibility } from 'humane-common';

export interface IPostRepository extends IBaseRepository<IPostDocument> {
   replace(postId: string, doc: IPostDocument): Promise<void>;

   getUserPosts(
      userId: string,
      from: string | null,
      limit: number,
      filter: {
         visibility: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined;
         moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus] | undefined;
      }
   ): Promise<{ posts: IPostDocument[]; from: string | null; hasMore: boolean }>;

   bulkUpdateCommentsCount(updates: { postId: string; delta: number }[]): Promise<{ ack: boolean }>;

   getPublicPostByHashtag(
      hashtag: string,
      from: string | null,
      limit: number
   ): Promise<{ posts: IPostDocument[]; from: string | null; hasMore: boolean }>;
}
