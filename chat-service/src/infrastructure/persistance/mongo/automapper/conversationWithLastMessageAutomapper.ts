import { HydratedDocument } from 'mongoose';
import { IConversationDocument } from '../models/conversation.model';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';
import { IMessageDocument } from '../models/Message.model';
import { messageAutoMapper } from './message.automapper';

export type ConversationWithLastMessage = Omit<Required<Conversation>, 'lastMessageId'> & {
   lastMessage: Required<Message> | undefined;
   unreadCount: number;
};

export const conversationWithLastMessageAutoMapper = (
   doc: HydratedDocument<IConversationDocument> & {
      unreadCount: number;
      lastMessage: HydratedDocument<IMessageDocument>;
   }
): ConversationWithLastMessage => {
   const conversation: Required<Conversation> = {
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

   const lastMessageDoc = doc.lastMessage;
   const lastMessage: Required<Message> | undefined = lastMessageDoc
      ? messageAutoMapper(lastMessageDoc)
      : undefined;

   return { ...conversation, lastMessage, unreadCount: doc.unreadCount || 0 };
};
