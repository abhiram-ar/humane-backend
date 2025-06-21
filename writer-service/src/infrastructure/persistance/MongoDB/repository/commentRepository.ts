import { Comment } from '@domain/entities/Comment.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';
import commentModel from '../Models/commentModel';
import { commentAutoMapper } from '../mapper/commentAutoMapper';
import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';
import { logger } from '@config/logget';

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
      const ops: Parameters<typeof commentModel.bulkWrite>[0] = dto.map((op) => ({
         updateOne: {
            filter: { _id: op.commentId },
            update: { $inc: { likeCount: op.likeCountDiff } },
         },
      }));

      const bulkwriteRes = await commentModel.bulkWrite(ops, { ordered: false });
      logger.info(`updated like count of ${bulkwriteRes.modifiedCount}/${dto.length} comments`);

      const commnetIds = dto.map((op) => op.commentId);
      const query = await commentModel.find({ _id: { $in: commnetIds } });

      return query.map((res) => commentAutoMapper(res));
   };
}
