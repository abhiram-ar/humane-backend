import { FeedPostEntity } from '@domain/FeedPost.entity';
import mongoose, { Document } from 'mongoose';

export interface IFeedDocument extends Omit<FeedPostEntity, 'id'>, Document {}

const timelineSchema = new mongoose.Schema<IFeedDocument>({
   userId: { type: String, required: true },
   postId: { type: String, required: true },
   authorId: { type: String, required: true }, // do we actually need to store authorId as it can be derived from postID, yes for effiecient unfiending removal of post
   createdAt: { type: Date, required: true },
});
timelineSchema.index({ userId: 1, postId: 1 }, { unique: true });

const feedModel = mongoose.model<IFeedDocument>('Timeline', timelineSchema);
export default feedModel;
