import { ConvoFrequentlyChagingMetadata } from '@domain/ConvoFrequentlyChangingMetadata';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { IConversationDocument } from './conversation.model';

export interface IConvoFrequentlyChangingMetadata
   extends Omit<Required<ConvoFrequentlyChagingMetadata>, 'convoId'>,
      Document {
   convoId: mongoose.Schema.Types.ObjectId | HydratedDocument<IConversationDocument>;
}

const conovFrequentlyChangingMetadataSchema = new mongoose.Schema<IConvoFrequentlyChangingMetadata>(
   {
      convoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
      lastMsgSendAt: { type: Date },
   }
);

conovFrequentlyChangingMetadataSchema.index({ convoId: 1 }, { unique: true });

const convoFreqChangingMetadataModel = mongoose.model<IConvoFrequentlyChangingMetadata>(
   'ConvoFreqChangingMetadata',
   conovFrequentlyChangingMetadataSchema
);

export default convoFreqChangingMetadataModel;
