import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { GetUserCovoByIdInputDTO } from '@application/dto/GetUserConversationById.dto';
import { SetConvoLastOpenedInputDTO } from '@application/dto/SetCovoLastOpened.dto';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { Conversation } from '@domain/Conversation';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import { IConversationServices } from '@ports/usecases/IConversationServices';

export class ConversationServices implements IConversationServices {
   constructor(private readonly _conversationRepo: IConversationRepository) {}

   create = async (dto: CreateConversationInputDTO): Promise<Required<Conversation>> => {
      const tempconvo = new Conversation({
         participants: dto.participants,
         type: dto.type,
         groupName: dto.groupName,
         groupPicKey: dto.groupPicKey,
      });
      return await this._conversationRepo.create(tempconvo);
   };

   getOneToOneConversationByParticipantIds = async (
      userIds: string[]
   ): Promise<Required<Conversation> | null> => {
      if (userIds.length === 0) return null;

      // TODO: read through cache

      return await this._conversationRepo.getOneToOneConversationByParticipantIds(userIds);
   };

   getUserConversation = async (dto: {
      userId: string;
      from: string | null;
      limit: number;
   }): Promise<{ conversations: ConversationWithLastMessage[]; pagination: CurosrPagination }> => {
      const { conversations, from, hasMore } = await this._conversationRepo.getUserConversations(
         dto.userId,
         dto.from,
         dto.limit
      );
      return { conversations, pagination: { from, hasMore } };
   };

   setLastOpenedAt = async (dto: SetConvoLastOpenedInputDTO) => {
      await this._conversationRepo.setUserLastOpenedAt(dto.conversationId, dto.userId, dto.time);
   };

   getUserConversationById = async (
      dto: GetUserCovoByIdInputDTO
   ): Promise<Required<Conversation> | null> => {
      return this._conversationRepo.getUserConversationById(dto.userId, dto.convoId);
   };
}
