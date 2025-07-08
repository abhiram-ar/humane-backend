import { Conversation, conversationTypes } from '@domain/Conversation';
import mongoose, { Document } from 'mongoose';

interface IConversationDocument extends Required<Omit<Conversation, 'id'>>, Document {}

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

      lastMessage: {
         senderId: String,
         message: String,
         isRead: Boolean,
      },
   },
   { timestamps: true }
);

const conversationModel = mongoose.model<IConversationDocument>('Conversation', conversationSchema);

export default conversationModel;
