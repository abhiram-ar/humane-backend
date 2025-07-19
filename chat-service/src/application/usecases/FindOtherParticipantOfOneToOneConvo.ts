import {
   ConversationError,
   conversationErrorMessages,
} from '@application/errors/ConversationError';
import { Conversation } from '@domain/Conversation';

export class FindOtherParticipantOfOneToOneConvo {
   execute = (participants: Conversation['participants'], currentUserId: string): string => {
      if (participants.length !== 2)
         throw new ConversationError(
            conversationErrorMessages.INVALID_ONE_TO_ONE_COVERSATION_BY_PARTIPIPANTS
         );

      const otherUserId = participants.find((user) => user.userId !== currentUserId)?.userId;

      return otherUserId as string;
   };
}
