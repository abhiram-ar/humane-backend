import { Message, messageType } from '@domain/Message';
import mongoose, { Document } from 'mongoose';

export interface IMessageDocument
   extends Omit<Message, 'id' | 'conversationId' | 'replyToMessageId'>,
      Document {
   conversationId: mongoose.Schema.Types.ObjectId;
   replyToMessageId: mongoose.Schema.Types.ObjectId;
}

const messageSchema = new mongoose.Schema<IMessageDocument>({
   senderId: { type: String, required: true },
   conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
   message: { type: String },

   sendAt: { type: Date, default: Date.now },
   status: { deleted: Boolean, deletedAt: Date },

   attachment: { attachmentType: String, attachmentKey: String },
   replyToMessageId: { type: mongoose.Types.ObjectId, ref: 'Message', required: false },

   type: {
      type: String,
      required: true,
      enum: [messageType.CALL, messageType.REGULAR],
      default: messageType.REGULAR,
   },
   callConnected: { type: Boolean },
});

messageSchema.index({ conversationId: 1 });

const messageModel = mongoose.model<IMessageDocument>('Message', messageSchema);

export default messageModel;
