import { ConversataionRepository } from '@infrastructure/persistance/mongo/repository/Conversation.repository';
import { MessageRepository } from '@infrastructure/persistance/mongo/repository/Message.repository';

export const conversationRepository = new ConversataionRepository();
export const messageRepository = new MessageRepository()