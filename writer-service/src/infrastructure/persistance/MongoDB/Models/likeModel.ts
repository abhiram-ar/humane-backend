import { Like } from '@domain/entities/Likes.entity';
import mongoose, { Document } from 'mongoose';

export interface ILikeDocument extends Required<Omit<Like, 'id' | 'commentId'>>, Document {
   commentId: mongoose.Schema.Types.ObjectId;
}

const likeSchema = new mongoose.Schema<ILikeDocument>(
   {
      authorId: { type: String, required: true },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
   },
   { timestamps: true }
);
likeSchema.index({ commentId: -1, authorId: 1 }, { unique: true });

const likeModel = mongoose.model<ILikeDocument>('Like', likeSchema);
export default likeModel;
