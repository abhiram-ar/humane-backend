import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { IConversationDocument } from './conversation.model';

export interface IConvoUserMetadataDocument
   extends Omit<Required<ConvoUserMetadata>, 'convoId'>,
      Document {
   convoId: mongoose.Schema.Types.ObjectId | HydratedDocument<IConversationDocument>;
}

const convoUserMetadataSchema = new mongoose.Schema<IConvoUserMetadataDocument>({
   convoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
   userId: { type: String, required: true },
   lastOpenedAt: { type: Date },
   clearedAt: { type: Date },
});

convoUserMetadataSchema.index({ convoId: 1, userId: 1 }, { unique: true });

const convoUserMetadataModel = mongoose.model<IConvoUserMetadataDocument>(
   'ConovUserMetadata',
   convoUserMetadataSchema
);

export default convoUserMetadataModel;
