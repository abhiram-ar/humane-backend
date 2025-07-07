import { OneToOneMessage } from '@domain/OneToOneMessage';
import mongoose, { Document } from 'mongoose';

export interface IOneToOneMessage extends Omit<OneToOneMessage, 'id' | 'conversationId'>, Document {
   conversationId: mongoose.Schema.Types.ObjectId;
}

const oneToOneMessageSchema = new mongoose.Schema<IOneToOneMessage>({
   senderId: { type: String, required: true },
   conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation', required: true },
   message: { type: String, required: true },

   sendAt: { type: Date, default: new Date() },
   isReadByRecipient: { type: Boolean, default: false, required: true },
   isSoftDeleted: { type: Boolean, default: false },

   attachment: { attachmentType: String, attachmentKey: String },
   replyToMessageId: { type: mongoose.Types.ObjectId, ref: 'OneToOneMessage', required: false },
});

const oneToOneMessageModel = mongoose.model<IOneToOneMessage>(
   'OneToOneMessage',
   oneToOneMessageSchema
);

export default oneToOneMessageModel;
