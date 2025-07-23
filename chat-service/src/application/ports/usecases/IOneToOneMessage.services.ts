import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Message } from '@domain/Message';

export interface IOneToOneMessageServices {
   create(dto: CreateOneToOneMessageInputDTO): Promise<AttachementURLHydratedMessage>;

   getMessages(dto: {
      conversationId: string;
      from: string | null;
      limit: number;
   }): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }>;
}
