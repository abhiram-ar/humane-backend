import { TimelinePost } from '@domain/TimelinePost.entity';
import mongoose, { Document } from 'mongoose';

export interface ITimelineDocument extends Omit<TimelinePost, 'id'>, Document {}

const timelineSchema = new mongoose.Schema<ITimelineDocument>({
   userId: { type: String, required: true },
   postId: { type: String, required: true },
   authorId: { type: String, required: true }, // do we actually need to store authorId as it can be derived from postID, yes for effiecient unfiending removal of post
   createdAt: { type: Date, required: true },
});
timelineSchema.index({ userId: 1, postId: 1 }, { unique: true });

const timelineModel = mongoose.model<ITimelineDocument>('Timeline', timelineSchema);
export default timelineModel;
