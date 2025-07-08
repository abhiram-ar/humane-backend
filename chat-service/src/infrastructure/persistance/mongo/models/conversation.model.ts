import { Conversation, conversationTypes } from '@domain/Conversation';
import mongoose, { Document } from 'mongoose';

export interface IConversationDocument
   extends Required<Omit<Conversation, 'id' | 'lastMessageId'>>,
      Document {
   lastMessageId: mongoose.Schema.Types.ObjectId;
}

const conversationSchema = new mongoose.Schema<IConversationDocument>(
   {
      type: {
         type: String,
         enum: [conversationTypes.ONE_TO_ONE, conversationTypes.GROUP],
         required: true,
      },

      groupName: { type: String, required: false },
      groupPicKey: { type: String, required: false },

      participants: [
         {
            userId: { type: String, required: true },
            joinedAt: { type: Date, default: Date.now },
            clearedAt: Date,
         },
      ],

      lastMessageId: {
         type: mongoose.Types.ObjectId,
         ref: 'Message',
      },
   },
   { timestamps: true }
);

conversationSchema.index({ type: 1, participants: 1 });

const conversationModel = mongoose.model<IConversationDocument>('Conversation', conversationSchema);

export default conversationModel;
