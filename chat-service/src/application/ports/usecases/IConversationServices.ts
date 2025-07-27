import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { GetUserCovoByIdInputDTO } from '@application/dto/GetUserConversationById.dto';
import { GetUserConversationInputDTO } from '@application/dto/GetUserConversations.dto';
import { SetConvoLastOpenedInputDTO } from '@application/dto/SetCovoLastOpened.dto';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Conversation } from '@domain/Conversation';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';

export interface IConversationServices {
   create(dto: CreateConversationInputDTO): Promise<Required<Conversation>>;

   getConvoById(convoId: string): Promise<Required<Conversation>>;

   getOneToOneConversationByParticipantIds(
      userIds: string[]
   ): Promise<Required<Conversation> | null>;

   getUserConversation(
      dto: GetUserConversationInputDTO
   ): Promise<{ conversations: ConversationWithLastMessage[]; pagination: CurosrPagination }>;

   setLastOpenedAt(dto: SetConvoLastOpenedInputDTO): Promise<void>;

   getUserConversationById(dto: GetUserCovoByIdInputDTO): Promise<Required<Conversation> | null>;
}
