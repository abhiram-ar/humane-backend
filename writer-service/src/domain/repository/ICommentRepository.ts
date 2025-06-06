import { IBaseRepository } from './IBaseRepository';
import { Comment } from '@domain/entities/Comment.entity';

export interface ICommentRepository extends IBaseRepository<Comment> {
   create(entity: Comment): Promise<Required<Comment>>;
   delete(authorId: string, commentId: string): Promise<Required<Comment> | null>;
}
