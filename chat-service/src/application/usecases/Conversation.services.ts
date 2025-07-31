import { ClearUserConvoInputDTO } from '@application/dto/ClearUserConov.dto';
import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { GetUserCovoByIdInputDTO } from '@application/dto/GetUserConversationById.dto';
import { SetConvoLastOpenedInputDTO } from '@application/dto/SetCovoLastOpened.dto';
import { ConversationNotFoundError } from '@application/errors/ConversationNotFoundError';
import { CurosrPagination } from '@application/Types/CursorPagination.type';
import { AppConstants } from '@config/constants';
import { Conversation } from '@domain/Conversation';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import { ICacheService } from '@ports/services/ICacheService';
import { IConversationServices } from '@ports/usecases/IConversationServices';

export class ConversationServices implements IConversationServices {
   constructor(
      private readonly _conversationRepo: IConversationRepository,
      private readonly _cache: ICacheService
   ) {}

   create = async (dto: CreateConversationInputDTO): Promise<Required<Conversation>> => {
      const tempconvo = new Conversation({
         participants: dto.participants,
         type: dto.type,
         groupName: dto.groupName,
         groupPicKey: dto.groupPicKey,
      });
      return await this._conversationRepo.create(tempconvo);
   };
   getConvoById = async (convoId: string): Promise<Required<Conversation>> => {
      const result = await this._conversationRepo.getConversationById(convoId);
      if (!result) throw new ConversationNotFoundError();
      return result;
   };

   getOneToOneConversationByParticipantIds = async (
      userIds: string[]
   ): Promise<Required<Conversation> | null> => {
      if (userIds.length === 0) return null;

      //read through cache
      const cacheKey = `conov1-1:${userIds.sort().join('|')}`;
      const cacheResult = await this._cache.get(cacheKey);
      if (cacheResult) {
         return JSON.parse(cacheResult);
      }

      const conversation = await this._conversationRepo.getOneToOneConversationByParticipantIds(
         userIds
      );

      if (conversation) {
         await this._cache.set(cacheKey, JSON.stringify(conversation), {
            expiryInMS: AppConstants.TIME_10MIN,
         });
      }

      return conversation;
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
   ): Promise<(Required<Conversation> & { updatedAt: Date | undefined }) | null> => {
      const convo = await this._conversationRepo.getUserConversationById(dto.userId, dto.convoId);
      if (!convo) return null;

      const convoMeta = await this._conversationRepo.getFrequentlyUpdatedMetadata(dto.convoId);

      return { ...convo, updatedAt: convoMeta?.updatedAt || undefined };
   };

   clearUserConvo = async (dto: ClearUserConvoInputDTO): Promise<Required<Conversation>> => {
      const convoUserMetadata = await this._conversationRepo.setUserConvoClearedAt(
         dto.userId,
         dto.convoId
      );
      if (!convoUserMetadata) {
         throw new ConversationNotFoundError();
      }

      const convo = await this._conversationRepo.getUserConversationById(dto.userId, dto.convoId);
      if (!convo) throw new ConversationNotFoundError();

      return convo;
   };
}
