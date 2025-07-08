import { Conversation, conversationTypes } from '@domain/Conversation';
import mongoose, { Document } from 'mongoose';

interface IConversationDocument
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

      participants: { type: [String], required: true, default: [] },

      lastMessageId: {
         type: mongoose.Types.ObjectId,
         ref: 'Message',
      },

      clearedChats: [
         {
            userId: { type: String },
            clearedAt: { type: Date, default: null },
         },
      ],
   },
   { timestamps: true }
);

const conversationModel = mongoose.model<IConversationDocument>('Conversation', conversationSchema);

export default conversationModel;
