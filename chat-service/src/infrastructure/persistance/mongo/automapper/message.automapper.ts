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
      isReadBy: doc.isReadBy,
      deletededFor: doc.deletededFor,
      attachment: doc.attachment,
      replyToMessageId: String(doc.replyToMessageId),
   };

   return entity;
};
