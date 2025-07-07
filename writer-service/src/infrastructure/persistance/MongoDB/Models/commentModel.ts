import { Comment } from '@domain/entities/Comment.entity';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { IPostDocumnet } from './postModel';

export interface ICommentDocument extends Required<Omit<Comment, 'id' | 'postId'>>, Document {
   postId: mongoose.Schema.Types.ObjectId | HydratedDocument<IPostDocumnet>;
}

const commentSchema = new mongoose.Schema<ICommentDocument>(
   {
      authorId: { type: String, required: true },
      content: { type: String, required: true },
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
      likeCount: { type: Number, default: 0 },
      likedByPostAuthor: { type: Boolean, default: false },
   },
   { timestamps: true }
);
commentSchema.index({ authorId: 1, _id: -1 });

const commentModel = mongoose.model<ICommentDocument>('Comment', commentSchema);
export default commentModel;
