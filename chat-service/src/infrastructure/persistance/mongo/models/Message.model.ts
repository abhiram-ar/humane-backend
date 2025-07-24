import { Message } from '@domain/Message';
import mongoose, { Document } from 'mongoose';

export interface IMessageDocument
   extends Omit<Message, 'id' | 'conversationId' | 'replyToMessageId'>,
      Document {
   conversationId: mongoose.Schema.Types.ObjectId;
   replyToMessageId: mongoose.Schema.Types.ObjectId;
}

const messageSchema = new mongoose.Schema<IMessageDocument>({
   senderId: { type: String, required: true },
   conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation', required: true },
   message: { type: String },

   sendAt: { type: Date, default: Date.now },
   deletededFor: { type: [String], default: [] },

   attachment: { attachmentType: String, attachmentKey: String },
   replyToMessageId: { type: mongoose.Types.ObjectId, ref: 'Message', required: false },
});

const messageModel = mongoose.model<IMessageDocument>('Message', messageSchema);

export default messageModel;
