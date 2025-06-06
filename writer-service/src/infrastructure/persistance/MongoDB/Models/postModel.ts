import { Post, PostVisibility } from '@domain/entities/Post.entity';
import mongoose, { Document } from 'mongoose';

export interface IPostDocumnet extends Required<Omit<Post, 'id'>>, Document {}

const postSchema = new mongoose.Schema<IPostDocumnet>(
   {
      authorId: { type: String, required: true },
      content: { type: String, required: true },
      visibility: { type: String, enum: Object.values(PostVisibility) },
      posterKey: { type: String, required: false },
   },
   { timestamps: true }
);
postSchema.index({ authorId: 1, _id: -1 });

const postModel = mongoose.model<IPostDocumnet>('Post', postSchema);

export default postModel;
