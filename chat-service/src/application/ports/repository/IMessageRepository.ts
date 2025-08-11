import { Message } from '@domain/Message';
import { IBaseRepository } from './IBaseRepository';
import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';

export interface IMessageRepository extends IBaseRepository<Message> {
   getOneToOneMessages(
      converstionId: string,
      from: string | null,
      limit: number,
      convoClearedAt: Date | undefined
   ): Promise<{ messages: Required<Message>[]; from: string | null; hasMore: boolean }>;

   softDeleteUserMessageById(dto: DeleteUserMessageInputDTO): Promise<Required<Message> | null>;

   getLastMessageOfOtherUserBeforeThisMessage(userMessage: {
      messageId: string;
      convoId: string;
      senderId: string;
      sendAt: Date;
   }): Promise<Required<Message> | null>;

   setCallMessageConnected(dto: {
      callId: string;
      callTaken: boolean;
   }): Promise<Required<Message> | null>;
}
