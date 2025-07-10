import { HydratedDocument } from 'mongoose';
import { IConversationDocument } from '../models/conversation.model';
import { Conversation } from '@domain/Conversation';

export const conversationAutomapper = (
   doc: HydratedDocument<IConversationDocument>
): Required<Conversation> => {
   const entiy: Required<Conversation> = {
      id: doc.id ?? String(doc._id),
      type: doc.type,
      groupName: doc.groupName,
      groupPicKey: doc.groupPicKey,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastMessageId: String(doc.lastMessageId),
      participants: doc.participants.map((user) => ({
         userId: user.userId,
         joinedAt: user.joinedAt,
         clearedAt: user.clearedAt,
         lastOpenedAt: user.lastOpenedAt,
      })),
   };

   return entiy;
};
