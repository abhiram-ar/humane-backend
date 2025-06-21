import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { IBaseRepository } from './IBaseRepository';
import { Comment } from '@domain/entities/Comment.entity';

export interface ICommentRepository extends IBaseRepository<Comment> {
   deleteAllPostComments(postId: string): Promise<{ deletedCount: number }>;

   bulkUpdateCommentCountFromDiff(dto: BulkUpdateCommentLikeCountInputDTO): Promise<Comment[]>;
}
