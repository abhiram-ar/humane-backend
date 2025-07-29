import { Conversation } from '@domain/Conversation';
import { IBaseRepository } from './IBaseRepository';
import { ConversationWithLastMessage } from '@infrastructure/persistance/mongo/automapper/conversationWithLastMessageAutomapper';
import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';
import { ConvoFrequentlyChagingMetadata } from '@domain/ConvoFrequentlyChangingMetadata';

export interface IConversationRepository extends IBaseRepository<Conversation> {
   getOneToOneConversationByParticipantIds(
      userIds: string[]
   ): Promise<Required<Conversation> | null>;

   getUserConversations(
      userId: string,
      from: string | null,
      limit: number
   ): Promise<{
      conversations: ConversationWithLastMessage[];
      from: string | null;
      hasMore: boolean;
   }>;

   setUserLastOpenedAt(conversationId: string, userId: string, time: Date): Promise<void>;

   getUserConversationById(userId: string, convoId: string): Promise<Required<Conversation> | null>;

   findManyUserOneToOneConvoByParticipantIds(
      userId: string,
      otherUserIds: string[],
      limit: number
   ): Promise<ConversationWithLastMessage[]>;

   getConversationById(converstionId: string): Promise<Required<Conversation> | null>;

   setUserConvoClearedAt(userId: string, convoId: string): Promise<ConvoUserMetadata | null>;

   getUserConvoMetadata(userId: string, convoId: string): Promise<ConvoUserMetadata | null>;

   getFrequentlyUpdatedMetadata(convoId: string): Promise<ConvoFrequentlyChagingMetadata | null>;
}
