import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';

export interface IOneToOneMessageServices {
   create(
      dto: CreateOneToOneMessageInputDTO
   ): Promise<{ message: AttachementURLHydratedMessage; convo: Required<Conversation> }>;

   getMessages(dto: {
      conversationId: string;
      from: string | null;
      limit: number;
      convoClearedAt: Date | undefined;
   }): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }>;
}
