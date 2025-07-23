import { ConversationServices } from '@application/usecases/Conversation.services';
import { conversationRepository, messageRepository } from './repository.container';
import { OneToOneMessageServices } from '@application/usecases/OneToOneMessage.services';
import { FindOtherParticipantOfOneToOneConvo } from '@application/usecases/FindOtherParticipantOfOneToOneConvo';
import { GetOneToOneConversaionMessages } from '@application/usecases/GetOneToOneConversationMessages';
import { storageService } from './services.container';

export const conversationServices = new ConversationServices(conversationRepository);

export const oneToOneMessageServices = new OneToOneMessageServices(
   messageRepository,
   conversationServices,
   storageService
);

export const findOtherParticipantOfOneToOneConvo = new FindOtherParticipantOfOneToOneConvo();

export const getOneToOneConversationMessages = new GetOneToOneConversaionMessages(
   conversationServices,
   oneToOneMessageServices,
   storageService
);
