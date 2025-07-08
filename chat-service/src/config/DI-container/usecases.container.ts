import { ConversationServices } from '@application/usecases/Conversation.services';
import { conversationRepository, messageRepository } from './repository.container';
import { OneToOneMessageServices } from '@application/usecases/OneToOneMessage.services';

export const conversationServices = new ConversationServices(conversationRepository);

export const oneToOneMessageServices = new OneToOneMessageServices(
   messageRepository,
   conversationServices
);
