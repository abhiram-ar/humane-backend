import { Message } from '@domain/Message';
import { IBaseRepository } from './IBaseRepository';
import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';

export interface IMessageRepository extends IBaseRepository<Message> {
   getOneToOneMessages(
      converstionId: string,
      from: string | null,
      limit: number
   ): Promise<{ messages: Required<Message>[]; from: string | null; hasMore: boolean }>;

   deleteUserMessageById(dto: DeleteUserMessageInputDTO): Promise<Required<Message> | null>;
}
