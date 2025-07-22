import { GetOneToOneConvoMessagesInputDTO } from '@application/dto/GetOneToOneConvoMessages.dto';
import { ConversationNotFoundError } from '@application/errors/ConversationNotFoundError';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Message } from '@domain/Message';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { IGetOneToOneConversaionMessages } from '@ports/usecases/IGetOneToOneConversationMessages';
import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';

export class GetOneToOneConversaionMessages implements IGetOneToOneConversaionMessages {
   constructor(
      private readonly _coverstionServices: IConversationServices,
      private readonly _oneToOneMessageServices: IOneToOneMessageServices
   ) {}

   execute = async (
      dto: GetOneToOneConvoMessagesInputDTO
   ): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }> => {
      const conversation = await this._coverstionServices.getOneToOneConversationByParticipantIds([
         dto.userId,
         dto.otherUserId,
      ]);
      if (!conversation) throw new ConversationNotFoundError();

      return await this._oneToOneMessageServices.getMessages({
         conversationId: conversation.id,
         from: dto.from,
         limit: dto.limit,
      });
   };
}
