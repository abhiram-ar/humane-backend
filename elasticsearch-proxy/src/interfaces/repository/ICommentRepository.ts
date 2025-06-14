import { ICommentDocument } from 'interfaces/ICommentDocument';
import { IBaseRepository } from './IBaseRepository';

export interface ICommenetRepository extends IBaseRepository<ICommentDocument> {
   deleteAllPostComments(postId: string): Promise<{ deletedCount: number }>;
}
