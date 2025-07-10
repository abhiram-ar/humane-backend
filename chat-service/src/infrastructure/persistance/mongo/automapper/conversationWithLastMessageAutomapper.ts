import { HydratedDocument } from 'mongoose';
import { IConversationDocument } from '../models/conversation.model';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';
import { IMessageDocument } from '../models/Message.model';
import { messageAutoMapper } from './message.automapper';

export type ConversationWithLastMessage = Omit<Required<Conversation>, 'lastMessageId'> & {
   lastMessage: Required<Message> | undefined;
};

export const conversationWithLastMessageAutoMapper = (
   doc: HydratedDocument<IConversationDocument>
): ConversationWithLastMessage => {
   const conversation: Omit<Required<Conversation>, 'lastMessageId'> = {
      id: doc.id ?? String(doc._id),
      type: doc.type,
      groupName: doc.groupName,
      groupPicKey: doc.groupPicKey,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      participants: doc.participants.map((entry) => ({
         userId: entry.userId,
         joinedAt: entry.joinedAt,
         lastOpenedAt: entry.lastOpenedAt,
      })),
   };

   const lastMessageDoc = doc.lastMessageId as HydratedDocument<IMessageDocument>;
   const lastMessage: Required<Message> | undefined = lastMessageDoc
      ? messageAutoMapper(lastMessageDoc)
      : undefined;

   return { ...conversation, lastMessage };
};
