import {
   ExistingConvo,
   SearchUserConvoInputDTO,
   SearchUserConvoOutputDTO,
   StartNewConvo,
} from '@application/dto/SearchUserConvo.dto';
import { ESProxyError, ESProxyErrorMsgs } from '@application/errors/EsProxyError';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import { IElasticSearchProxyService } from '@ports/services/IElasticSearchProxyService';
import { IFindOtherParticipantOfOneToOneConvo } from '@ports/usecases/IFindOtherParticipantOfOneToOneConvo';

export class SearchUserCovo {
   constructor(
      private readonly _esProxyService: IElasticSearchProxyService,
      private readonly _convoRepo: IConversationRepository,
      private readonly _findOtherParticipantOfOneToOneConvo: IFindOtherParticipantOfOneToOneConvo
   ) {}
   execute = async (dto: SearchUserConvoInputDTO): Promise<SearchUserConvoOutputDTO> => {
      const result = await this._esProxyService.searchUser({
         searchQuery: dto.searchQuery,
         limit: dto.limit,
         page: dto.page,
      });

      if (!result) {
         throw new ESProxyError(ESProxyErrorMsgs.USER_SEARCH_FAILED);
      }

      const otherUserIds = result.users
         .filter((user) => user.id !== dto.currentUserId)
         .map((user) => user.id);

      if (otherUserIds.length === 0) {
         return { existingConvos: [], startNewConvos: [] };
      }

      const userConvoWithLastMsg = await this._convoRepo.findManyUserOneToOneConvoByParticipantIds(
         dto.currentUserId,
         otherUserIds,
         dto.limit
      );
      const userIdToConvoWithLastMsgMap = new Map<string, ConversationWithLastMessage>();
      userConvoWithLastMsg.forEach((convo) => {
         userIdToConvoWithLastMsgMap.set(
            this._findOtherParticipantOfOneToOneConvo.execute(
               convo.participants,
               dto.currentUserId
            ),
            convo
         );
      });

      const existingConvos: ExistingConvo[] = [];
      const startNewConvos: StartNewConvo[] = [];

      result.users.forEach((user) => {
         const convo = userIdToConvoWithLastMsgMap.get(user.id);
         if (convo) {
            existingConvos.push({ ...convo, otherUserDetails: user });
         } else {
            startNewConvos.push({ otherUserDetails: user });
         }
      });

      return { existingConvos, startNewConvos };
   };
}
