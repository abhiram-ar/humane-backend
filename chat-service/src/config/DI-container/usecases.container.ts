import { ConversationServices } from '@application/usecases/Conversation.services';
import { conversationRepository } from './repository.container';

export const conversationServices = new ConversationServices(conversationRepository);
