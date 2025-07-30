import { IEventPublisher } from '@ports/services/IEventProducer';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { IMessageService } from '@ports/usecases/IMessage.services';
import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';
import { ClientEventHandler } from '@presentation/websocket/handlers/ClientEventHandler';
import { TypedSocket } from '@presentation/websocket/Types/TypedSocket';

export class ChatClientEventHandlerFactory {
   constructor(
      private readonly _convoServices: IConversationServices,
      private readonly oneToOneMessageServices: IOneToOneMessageServices,
      private readonly _messageServices: IMessageService,
      private readonly _eventPubliser: IEventPublisher
   ) {}

   create = (clientSocket: TypedSocket) => {
      return new ClientEventHandler(
         clientSocket,
         this._convoServices,
         this.oneToOneMessageServices,
         this._messageServices,
         this._eventPubliser
      );
   };
}
