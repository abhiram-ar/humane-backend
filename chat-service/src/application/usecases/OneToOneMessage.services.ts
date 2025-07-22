import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { conversationTypes } from '@domain/Conversation';
import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';

export class OneToOneMessageServices implements IOneToOneMessageServices {
   constructor(
      private readonly _messageRepo: IMessageRepository,
      private readonly _conversationServices: IConversationServices
   ) {}

   create = async (dto: CreateOneToOneMessageInputDTO): Promise<Required<Message>> => {
      // retrive the conversation - read through cache
      let conversation = await this._conversationServices.getOneToOneConversationByParticipantIds([
         dto.from,
         dto.to,
      ]);

      // if does not exist create one
      if (!conversation) {
         conversation = await this._conversationServices.create({
            participants: [dto.from, dto.to],
            type: conversationTypes.ONE_TO_ONE,
         });
      }

      // crete a message
      const tempMessage = new Message({
         senderId: dto.from,
         conversationId: conversation.id,
         message: dto.message,
         attachment: dto.attachment,
      });

      const newMessage = await this._messageRepo.create(tempMessage);

      // send messge to the recipinet or coversation room
      return newMessage;
   };

   getMessages = async (dto: {
      conversationId: string;
      from: string | null;
      limit: number;
   }): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }> => {
      const result = await this._messageRepo.getOneToOneMessages(
         dto.conversationId,
         dto.from,
         dto.limit
      );

      // todo: attachment saturation

      return {
         messages: result.messages,
         pagination: { from: result.from, hasMore: result.hasMore },
      };
   };
}
