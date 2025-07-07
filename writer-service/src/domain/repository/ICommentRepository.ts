import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { IBaseRepository } from './IBaseRepository';
import { Comment } from '@domain/entities/Comment.entity';
import { Post } from '@domain/entities/Post.entity';

export interface ICommentRepository extends IBaseRepository<Comment> {
   deleteAllPostComments(postId: string): Promise<{ deletedCount: number }>;

   bulkUpdateCommentCountFromDiff(dto: BulkUpdateCommentLikeCountInputDTO): Promise<Comment[]>;

   getCommnetLikeMetadataByIds(
      commentIds: string[]
   ): Promise<Pick<Required<Comment>, 'id' | 'likeCount' | 'likedByPostAuthor'>[]>;

   getCommnetWithPostData(
      commnetId: string
   ): Promise<{ comment: Required<Comment>; post: Required<Post> | undefined } | null>;

   setLikedByPostAuthor(
      commentId: string,
      isLikedByPostAuthor: boolean
   ): Promise<Required<Comment> | null>;
}
