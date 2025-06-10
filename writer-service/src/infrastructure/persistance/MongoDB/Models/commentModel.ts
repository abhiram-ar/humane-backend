import { Comment } from '@domain/entities/Comment.entity';
import mongoose, { Document } from 'mongoose';

export interface ICommentDocument extends Required<Omit<Comment, 'id' | 'postId'>>, Document {
   postId: mongoose.Schema.Types.ObjectId;
}

const commentSchema = new mongoose.Schema<ICommentDocument>(
   {
      authorId: { type: String, required: true },
      content: { type: String, required: true },
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
   },
   { timestamps: true }
);
commentSchema.index({ authorId: 1, _id: -1 });

const commentModel = mongoose.model<ICommentDocument>('Comment', commentSchema);
export default commentModel;
