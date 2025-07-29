import { GetOneToOneConvoMessagesInputDTO } from '@application/dto/GetOneToOneConvoMessages.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { CurosrPagination } from '@application/Types/CursorPagination.type';

export interface IGetOneToOneConversaionMessages {
   execute(dto: GetOneToOneConvoMessagesInputDTO): Promise<{
      messages: AttachementURLHydratedMessage[];
      pagination: CurosrPagination;
   }>;
}
