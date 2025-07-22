import { Message } from '@domain/Message';
import { IBaseRepository } from './IBaseRepository';

export interface IMessageRepository extends IBaseRepository<Message> {
   getOneToOneMessages(
      converstionId: string,
      from: string | null,
      limit: number
   ): Promise<{ messages: Required<Message>[]; from: string | null; hasMore: boolean }>;
}
