import { HydratedDocument } from 'mongoose';
import { IMessageDocument } from '../models/Message.model';
import { Message } from '@domain/Message';

export const messageAutoMapper = (doc: HydratedDocument<IMessageDocument>): Required<Message> => {
   const entity: Required<Message> = {
      id: doc.id ?? String(doc._id),
      senderId: doc.senderId,
      conversationId: String(doc.conversationId),
      message: doc.message,
      sendAt: doc.sendAt,
      deletededFor: doc.deletededFor,
      attachment: doc.attachment,
      replyToMessageId: doc.replyToMessageId ? String(doc.replyToMessageId) : undefined,
   };

   return entity;
};
