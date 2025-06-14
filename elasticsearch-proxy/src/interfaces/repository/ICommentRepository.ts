import { ICommentDocument } from 'interfaces/ICommentDocument';
import { IBaseRepository } from './IBaseRepository';

export interface ICommenetRepository extends IBaseRepository<ICommentDocument> {
   deleteAllPostComments(postId: string): Promise<{ deletedCount: number }>;

   getPostComments(
      postId: string,
      from: string | null,
      limit: number
   ): Promise<{ comments: ICommentDocument[]; from: string | null; hasMore: boolean }>;
}
