import {
   ModerationStatus,
   Post,
   PostAttachmentStatus,
   PostVisibility,
} from '@domain/entities/Post.entity';
import mongoose, { Document } from 'mongoose';

export interface IPostDocumnet extends Required<Omit<Post, 'id'>>, Document {}

const postSchema = new mongoose.Schema<IPostDocumnet>(
   {
      authorId: { type: String, required: true },
      content: { type: String, required: true },
      visibility: { type: String, enum: Object.values(PostVisibility) },
      hashtags: { type: [String], default: [] },

      attachmentType: {
         type: String,
         required: false,
      },
      rawAttachmentKey: { type: String, required: false },
      attachmentStatus: {
         type: String,
         enum: [...Object.values(PostAttachmentStatus)],
         default: PostAttachmentStatus.PROCESSING,
      },
      processedAttachmentKey: { type: String, required: false },

      moderationStatus: {
         type: String,
         enum: [...Object.values(ModerationStatus)],
         default: ModerationStatus.PENDING,
      },
      moderationMetadata: { type: Object },
   },
   { timestamps: true }
);
postSchema.index({ authorId: 1, _id: -1 });

const postModel = mongoose.model<IPostDocumnet>('Post', postSchema);

export default postModel;
