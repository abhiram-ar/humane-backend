import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import messageModel from '../models/Message.model';
import { messageAutoMapper } from '../automapper/message.automapper';

export class MessageRepository implements IMessageRepository {
   create = async (entity: Message): Promise<Required<Message>> => {
      const res = await messageModel.create({
         senderId: entity.senderId,
         conversationId: entity.conversationId,
         message: entity.message,
         sendAt: entity.sendAt,
         attachment: entity.attachment,
         replyToMessageId: entity.replyToMessageId,
      });
      return messageAutoMapper(res);
   };
   delete(entity: Message): Promise<Required<Message> | null> {
      throw new Error('Method not implemented.');
   }
}
