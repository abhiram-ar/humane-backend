import { ConversationServices } from '@application/usecases/Conversation.services';
import { conversationRepository, messageRepository } from './repository.container';
import { OneToOneMessageServices } from '@application/usecases/OneToOneMessage.services';
import { FindOtherParticipantOfOneToOneConvo } from '@application/usecases/FindOtherParticipantOfOneToOneConvo';

export const conversationServices = new ConversationServices(conversationRepository);

export const oneToOneMessageServices = new OneToOneMessageServices(
   messageRepository,
   conversationServices
);

export const findOtherParticipantOfOneToOneConvo = new FindOtherParticipantOfOneToOneConvo()