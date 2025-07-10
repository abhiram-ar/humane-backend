import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { GetUserConversationInputDTO } from '@application/dto/GetUserConversations.dto';
import { Conversation } from '@domain/Conversation';

export interface IConversationServices {
   create(dto: CreateConversationInputDTO): Promise<Required<Conversation>>;

   getConversationByParticipantIds(userIds: string[]): Promise<Required<Conversation> | null>;

   getUserConversation(dto: GetUserConversationInputDTO): Promise<unknown>;
}
