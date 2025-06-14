import { IBaseRepository } from './IBaseRepository';
import { Comment } from '@domain/entities/Comment.entity';

export interface ICommentRepository extends IBaseRepository<Comment> {
   deleteAllPostComments(postId: string): Promise<{ deletedCount: number }>;
}
