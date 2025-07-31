import { ChatClientEventHandlerFactory } from '@presentation/factories/ChatClientEventHanderFactory';
import {
   conversationServices,
   messageServices,
   oneToOneMessageServices,
} from './usecases.container';
import { eventPubliser } from './services.container';

export const chatClientEventHanderFactory = new ChatClientEventHandlerFactory(
   conversationServices,
   oneToOneMessageServices,
   messageServices,
   eventPubliser
);
