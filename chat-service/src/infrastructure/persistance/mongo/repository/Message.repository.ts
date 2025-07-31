import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import messageModel from '../models/Message.model';
import { messageAutoMapper } from '../automapper/message.automapper';
import mongoose from 'mongoose';
import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';
import convoFreqChangingMetadataModel from '../models/convoFrequntlyChangingMetadata.model';

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

         await convoFreqChangingMetadataModel.updateOne(
            { convoId: entity.conversationId },
            { updatedAt: new Date() },
            { session, upsert: true }
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

   getOneToOneMessages = async (
      converstionId: string,
      from: string | null,
      limit: number,
      convoClearedAt: Date | undefined
   ): Promise<{ messages: Required<Message>[]; from: string | null; hasMore: boolean }> => {
      let lastMessageId: string | undefined;
      let lastSendAt: string | undefined;
      if (from) {
         [lastSendAt, lastMessageId] = from.split('|');
      }

      console.log(convoClearedAt);

      const result = await messageModel
         .find({
            conversationId: converstionId,
            sendAt: { $gt: convoClearedAt || new Date(0) },
            $or: from
               ? [
                    { sendAt: { $lt: lastSendAt } },
                    { sendAt: { $lte: lastSendAt }, _id: { $lt: lastMessageId } },
                 ]
               : [],
         })
         .sort({ sendAt: -1, id: -1 })
         .limit(limit);

      let hasMore = result.length === limit;
      let newFrom: string | undefined;
      let lastElem = result.at(-1);
      if (lastElem) {
         newFrom = `${lastElem.sendAt.toISOString()}|${lastElem.id}`;
      }

      return { messages: result.map(messageAutoMapper), from: newFrom ?? null, hasMore };
   };

   softDeleteUserMessageById = async (
      dto: DeleteUserMessageInputDTO
   ): Promise<Required<Message> | null> => {
      try {
         const result = await messageModel.findOneAndUpdate(
            {
               senderId: dto.userId,
               _id: dto.messageId,
            },
            { $unset: { message: '' }, $set: { status: { deleted: true, deletedAt: new Date() } } },
            { new: true }
         );

         if (!result) return null;

         return messageAutoMapper(result);
      } catch (error) {
         return null;
      }
   };

   getLastMessageOfOtherUserBeforeThisMessage = async (userMessage: {
      messageId: string;
      convoId: string;
      senderId: string;
      sendAt: Date;
   }): Promise<Required<Message> | null> => {
      const res = await messageModel
         .findOne({
            conversationId: new mongoose.Types.ObjectId(userMessage.convoId),
            senderId: { $ne: userMessage.senderId },
            sendAt: { $lt: userMessage.sendAt },
         })
         .sort({ _id: -1 });

      return res ? messageAutoMapper(res) : null;
   };
}
