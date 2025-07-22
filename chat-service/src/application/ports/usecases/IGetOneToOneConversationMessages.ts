import { GetOneToOneConvoMessagesInputDTO } from '@application/dto/GetOneToOneConvoMessages.dto';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Message } from '@domain/Message';

export interface IGetOneToOneConversaionMessages {
   execute(
      dto: GetOneToOneConvoMessagesInputDTO
   ): Promise<{ messages: Required<Message>[]; pagination: CurosrPagination }>;
}
