import { CreateOneToOneCallInputDTO } from '@application/dto/CreateOneToOneCall.dto';
import { Conversation, conversationTypes } from '@domain/Conversation';
import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { IOneToOneCallServices } from '@ports/usecases/IOneToOneCallServices';

export class OneToOneCallServices implements IOneToOneCallServices {
   constructor(
      private readonly _messageRepo: IMessageRepository,
      private readonly _conversationServices: IConversationServices
   ) {}

   create = async (
      dto: CreateOneToOneCallInputDTO
   ): Promise<{ callMessage: Required<Message>; convo: Required<Conversation> }> => {
      // convo - from read through cache
      let conversation = await this._conversationServices.getOneToOneConversationByParticipantIds([
         dto.from,
         dto.to,
      ]);

      if (!conversation) {
         conversation = await this._conversationServices.create({
            participants: [dto.from, dto.to],
            type: conversationTypes.ONE_TO_ONE,
         });
      }

      const tempMessage = new Message({
         senderId: dto.from,
         conversationId: conversation.id,
         type: 'call',
      });

      const newMessage = await this._messageRepo.create(tempMessage);

      return {
         callMessage: newMessage,
         convo: conversation,
      };
   };

   callTaken = async (dto: { callId: string }): Promise<Required<Message> | null> => {
      return await this._messageRepo.setCallMessageConnected({
         callId: dto.callId,
         callTaken: true,
      });
   };
}
