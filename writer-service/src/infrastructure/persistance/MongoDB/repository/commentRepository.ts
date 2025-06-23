import { Comment } from '@domain/entities/Comment.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';
import commentModel from '../Models/commentModel';
import { commentAutoMapper } from '../mapper/commentAutoMapper';
import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { logger } from '@config/logget';
import { isValidObjectId } from 'mongoose';

export class CommentRepository implements ICommentRepository {
   create = async (comment: Comment): Promise<Required<Comment>> => {
      const res = await commentModel.create({
         postId: comment.postId,
         authorId: comment.authorId,
         content: comment.content,
      });

      return commentAutoMapper(res);
   };
   delete = async (authorId: string, commentId: string): Promise<Required<Comment> | null> => {
      const res = await commentModel.findOneAndDelete({ authorId, _id: commentId }).lean();

      if (!res) return null;

      return commentAutoMapper(res);
   };

   deleteAllPostComments = async (postId: string): Promise<{ deletedCount: number }> => {
      const res = await commentModel.deleteMany({ postId });
      return { deletedCount: res.deletedCount };
   };

   bulkUpdateCommentCountFromDiff = async (
      dto: BulkUpdateCommentLikeCountInputDTO
   ): Promise<Comment[]> => {
      const sanitizedDTO = dto.filter((op) => {
         if (isValidObjectId(op.commentId)) return true;
         logger.warn(`Invalid objectId (comment: ${op.commentId}), skipping like count updation`);
         return false;
      });

      const ops: Parameters<typeof commentModel.bulkWrite>[0] = sanitizedDTO.map((op) => ({
         updateOne: {
            filter: { _id: op.commentId },
            update: { $inc: { likeCount: op.likeCountDiff } },
         },
      }));

      if (ops.length === 0) return [];

      const bulkwriteRes = await commentModel.bulkWrite(ops, { ordered: false });
      logger.info(`updated like count of ${bulkwriteRes.modifiedCount}/${dto.length} comments`);

      const commnetIds = sanitizedDTO.map((op) => op.commentId);
      const query = await commentModel.find({ _id: { $in: commnetIds } });

      return query.map((res) => commentAutoMapper(res));
   };

   getCommnetLikeMetadataByIds = async (
      commentIds: string[]
   ): Promise<Pick<Required<Comment>, 'id' | 'likeCount' | 'likedByPostAuthor'>[]> => {
      if (commentIds.length === 0) return [];

      const res = await commentModel.find(
         { _id: { $in: commentIds } },
         { likedByPostAuthor: 1, likeCount: 1 }
      );

      const parsed: Pick<Required<Comment>, 'id' | 'likeCount' | 'likedByPostAuthor'>[] = res.map(
         (doc) => ({
            id: doc.id,
            likedByPostAuthor: doc.likedByPostAuthor,
            likeCount: doc.likeCount,
         })
      );

      return parsed;
   };
}
