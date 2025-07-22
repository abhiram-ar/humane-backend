import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Message } from '@domain/Message';

export interface IOneToOneMessageServices {
   create(dto: CreateOneToOneMessageInputDTO): Promise<Required<Message>>;

   getMessages(dto: {
      conversationId: string;
      from: string | null;
      limit: number;
   }): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }>;
}
