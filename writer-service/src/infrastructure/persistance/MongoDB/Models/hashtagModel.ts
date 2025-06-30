import { HashTag } from '@domain/entities/hashtag.entity';
import mongoose, { Document } from 'mongoose';

export interface IHashtagDocument extends Required<HashTag>, Document {
   name: string;
   count: number;
}

const hashtagSchema = new mongoose.Schema<IHashtagDocument>({
   name: { type: String, required: true },
   count: { type: Number, required: true, default: 0 },
});
hashtagSchema.index(
   { name: 1 },
   { unique: true, partialFilterExpression: { count: { $gte: 3 } } } // increase this count, if we need to filter only popular hashtag in the future
);

const hashtagModel = mongoose.model<IHashtagDocument>('Hashtag', hashtagSchema);
export default hashtagModel;
