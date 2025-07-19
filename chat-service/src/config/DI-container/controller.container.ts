import { ConversationController } from '@presentation/http/controller/Conversation.controller';
import { conversationServices, findOtherParticipantOfOneToOneConvo } from './usecases.container';
import { esproxyService } from './services.container';

export const conversationController = new ConversationController(
   conversationServices,
   findOtherParticipantOfOneToOneConvo,
   esproxyService
);
