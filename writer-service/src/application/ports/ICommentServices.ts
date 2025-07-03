import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { CreateCommentDTO } from '@application/dtos/CreateComment';
import { DeleteCommentDTO } from '@application/dtos/DeleteComment.dto';
import { Comment } from '@domain/entities/Comment.entity';
import { Like } from '@domain/entities/Likes.entity';
import { Post } from '@domain/entities/Post.entity';

export interface ICommentService {
   create(dto: CreateCommentDTO): Promise<Required<Comment>>;
   delete(dto: DeleteCommentDTO): Promise<Required<Comment>>;
   deleteAllPostComments(postId: string): Promise<void>;
   bulkUpdateCommentLikeCountFromDiff(dto: BulkUpdateCommentLikeCountInputDTO): Promise<unknown>;

   getCommnetLikeMetadataByIds(
      commentIds: string[]
   ): Promise<Pick<Required<Comment>, 'id' | 'likeCount' | 'likedByPostAuthor'>[]>;

   setCommentLikedByPostAuthor(
      like: Like
   ): Promise<{ post: Required<Post>; comment: Required<Comment> } | void>;
}
