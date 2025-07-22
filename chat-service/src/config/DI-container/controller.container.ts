import { ConversationController } from '@presentation/http/controller/Conversation.controller';
import {
   conversationServices,
   findOtherParticipantOfOneToOneConvo,
   getOneToOneConversationMessages,
} from './usecases.container';
import { esproxyService } from './services.container';
import { MessageController } from '@presentation/http/controller/Message.controller';

export const conversationController = new ConversationController(
   conversationServices,
   findOtherParticipantOfOneToOneConvo,
   esproxyService
);

export const messsageController = new MessageController(getOneToOneConversationMessages);
