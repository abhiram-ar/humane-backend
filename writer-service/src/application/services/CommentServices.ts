import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { CreateCommentDTO } from '@application/dtos/CreateComment';
import { DeleteCommentDTO } from '@application/dtos/DeleteComment.dto';
import { EntityNotFound } from '@application/errors/EntityNotFoundError';
import { logger } from '@config/logget';
import { Comment } from '@domain/entities/Comment.entity';
import { Like } from '@domain/entities/Likes.entity';
import { Post } from '@domain/entities/Post.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';
import { IPostRepository } from '@domain/repository/IPostRepository';
import { ICommentService } from '@ports/ICommentServices';
import { IEventPublisher } from '@ports/IEventProducer';
import {
   AppEventsTypes,
   CommentLikedByPostAuthorPayload,
   createEvent,
   MessageBrokerTopics,
} from 'humane-common';

export class CommentService implements ICommentService {
   constructor(
      private readonly _commentRepo: ICommentRepository,
      private readonly _postRepo: IPostRepository,

      private readonly _eventPublisher: IEventPublisher
   ) {}

   create = async (dto: CreateCommentDTO): Promise<Required<Comment>> => {
      if (!(await this._postRepo.exists(dto.postId))) {
         throw new EntityNotFound('Post does not exists to add comment');
      }

      const comment = new Comment(dto.authorId, dto.postId, dto.content);

      return await this._commentRepo.create(comment);
   };

   delete = async (dto: DeleteCommentDTO): Promise<Required<Comment>> => {
      const deletedComment = await this._commentRepo.delete(dto.authorId, dto.commentId);
      if (!deletedComment) {
         throw new EntityNotFound(
            `user does not have comment my the provided commentId ${dto.commentId})`
         );
      } else return deletedComment;
   };

   deleteAllPostComments = async (postId: string): Promise<void> => {
      const { deletedCount } = await this._commentRepo.deleteAllPostComments(postId);
      logger.info(`removed ${deletedCount} comments related to post(${postId})`);
   };

   bulkUpdateCommentLikeCountFromDiff = async (dto: BulkUpdateCommentLikeCountInputDTO) => {
      const res = this._commentRepo.bulkUpdateCommentCountFromDiff(dto);
      return res;

      // TODO: upadte cache
   };
   getCommnetLikeMetadataByIds = async (
      commentIds: string[]
   ): Promise<Pick<Required<Comment>, 'id' | 'likeCount' | 'likedByPostAuthor'>[]> => {
      // TODO: read through cache
      return await this._commentRepo.getCommnetLikeMetadataByIds(commentIds);
   };

   /** funtion ignores the cases in which comment is put by the post author and the corresponding likes */
   setCommentLikedByPostAuthor = async (
      like: Like
   ): Promise<{ post: Required<Post>; comment: Required<Comment> } | void> => {
      const data = await this._commentRepo.getCommnetWithPostData(like.commentId);

      if (!data || !data.post) {
         return;
      }

      // skip processing, if reprocessing
      if (data.comment.likedByPostAuthor) return;

      if (!(like.authorId === data.post.authorId && data.comment.authorId !== data.post.authorId)) {
         return;
      }

      //write back new state to comentModel
      const updatedComment = await this._commentRepo.setLikedByPostAuthor(data.comment.id, true);
      if (!updatedComment) return;

      // publish event
      const eventPayload: CommentLikedByPostAuthorPayload = {
         commentId: updatedComment.id,
         commentAutorId: updatedComment.authorId,
         postId: data.post.id,
         postAuthorId: data.post.authorId,
      };

      const commentLikedByPostAuthorEvent = createEvent(
         AppEventsTypes.COMMENT_LIKED_BY_POST_AUTHUR,
         eventPayload
      );

      await this._eventPublisher.send(
         MessageBrokerTopics.COMMENT_LIKED_BY_POST_AUTHOR_TOPIC,
         commentLikedByPostAuthorEvent
      );

      return { post: data.post, comment: updatedComment };
   };
}
