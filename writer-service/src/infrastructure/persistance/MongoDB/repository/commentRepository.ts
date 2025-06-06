import { Comment } from '@domain/entities/Comment.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';
import commentModel from '../Models/commentModel';
import { commentAutoMapper } from '../mapper/commentAutoMapper';

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
}
