import { ConversationServices } from '@application/usecases/Conversation.services';
import { conversationRepository, messageRepository } from './repository.container';
import { OneToOneMessageServices } from '@application/usecases/OneToOneMessage.services';
import { FindOtherParticipantOfOneToOneConvo } from '@application/usecases/FindOtherParticipantOfOneToOneConvo';
import { GetOneToOneConversaionMessages } from '@application/usecases/GetOneToOneConversationMessages';
import { esproxyService, storageService } from './services.container';
import { SearchUserCovo } from '@application/usecases/SearchUserConvo';
import { MessageService } from '@application/usecases/Message.services';
import { ConovUserMetadataServices } from '@application/usecases/ConovUserMetadataServices';

export const conversationServices = new ConversationServices(conversationRepository);

export const oneToOneMessageServices = new OneToOneMessageServices(
   messageRepository,
   conversationServices,
   storageService
);

export const findOtherParticipantOfOneToOneConvo = new FindOtherParticipantOfOneToOneConvo();

export const convoUserMetadataService = new ConovUserMetadataServices(conversationRepository);

export const getOneToOneConversationMessages = new GetOneToOneConversaionMessages(
   conversationServices,
   oneToOneMessageServices,
   storageService,
   convoUserMetadataService
);

export const searchUserConvo = new SearchUserCovo(
   esproxyService,
   conversationRepository,
   findOtherParticipantOfOneToOneConvo
);

export const messageServices = new MessageService(messageRepository);
