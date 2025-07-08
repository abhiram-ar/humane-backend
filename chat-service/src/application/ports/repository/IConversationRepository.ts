import { Conversation } from '@domain/Conversation';
import { IBaseRepository } from './IBaseRepository';

export interface IConversationRepository extends IBaseRepository<Conversation> {
   getOneToOneConversationByParticipantIds(userIds: string[]): Promise<Required<Conversation> | null>;
}
