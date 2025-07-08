import { Message } from '@domain/Message';
import mongoose, { Document } from 'mongoose';

export interface IMessage extends Omit<Message, 'id' | 'conversationId'>, Document {
   conversationId: mongoose.Schema.Types.ObjectId;
}

const oneToOneMessageSchema = new mongoose.Schema<IMessage>({
   senderId: { type: String, required: true },
   conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation', required: true },
   message: { type: String, required: true },

   sendAt: { type: Date, default: Date.now },
   isReadBy: { type: [String], default: [] },
   deletededFor: { type: [String], default: [] },

   attachment: { attachmentType: String, attachmentKey: String },
   replyToMessageId: { type: mongoose.Types.ObjectId, ref: 'Message', required: false },
});

const oneToOneMessageModel = mongoose.model<IMessage>('Message', oneToOneMessageSchema);

export default oneToOneMessageModel;
