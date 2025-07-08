import { ConversationController } from '@presentation/http/controller/Conversation.controller';
import { conversationServices } from './usecases.container';

export const conversationController = new ConversationController(conversationServices);
