import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import messageModel from '../models/Message.model';
import { messageAutoMapper } from '../automapper/message.automapper';
import mongoose from 'mongoose';
import conversationModel from '../models/conversation.model';

export class MessageRepository implements IMessageRepository {
   create = async (entity: Message): Promise<Required<Message>> => {
      const session = await mongoose.startSession();
      try {
         session.startTransaction();

         const message = await messageModel.create(
            [
               {
                  senderId: entity.senderId,
                  conversationId: entity.conversationId,
                  message: entity.message,
                  sendAt: entity.sendAt,
                  attachment: entity.attachment,
                  replyToMessageId: entity.replyToMessageId,
               },
            ],
            { session }
         );

         await conversationModel.findByIdAndUpdate(
            entity.conversationId,
            { lastMessageId: message[0].id },
            { session }
         );

         await session.commitTransaction();
         await session.endSession();

         return messageAutoMapper(message[0]);
      } catch (error) {
         await session.abortTransaction();
         await session.endSession();
         throw error;
      }
   };
   delete(entity: Message): Promise<Required<Message> | null> {
      throw new Error('Method not implemented.');
   }
}
