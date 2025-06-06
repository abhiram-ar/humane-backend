import { IBaseRepository } from './BaseRepository';
import { Comment } from '@domain/entities/Comment.entity';

export interface ICommentRepository extends IBaseRepository<Comment> {
   create(entity: Comment): Promise<Required<Comment>>;
   delete(entity: Comment): Promise<Required<Comment>>;
}
