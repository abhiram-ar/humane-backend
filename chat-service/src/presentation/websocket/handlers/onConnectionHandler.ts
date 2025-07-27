import { logger } from '@config/logger';
import { TypedSocket } from '../Types/TypedSocket';
import { conversationServices, oneToOneMessageServices } from '@di/usecases.container';
import { ClientEventHandler } from './ClientEventHandler';

export const onConnectionHandler = (socket: TypedSocket) => {
   logger.info(`New connection from ${socket.data.userId}`);

   socket.join(socket.data.userId);
   socket.emit('test', `Connected to server, UserId:${socket.data.userId}`);

   const clientEventHandler = new ClientEventHandler(
      socket,
      conversationServices,
      oneToOneMessageServices
   );

   socket.on('hello', clientEventHandler.hello);

   socket.on('send-one-to-one-message', clientEventHandler['send-one-to-one-message']);

   socket.on('convo-opened', clientEventHandler['convo-opened']);

   socket.on('disconnect', () => {
      logger.debug(`socket disconnected userId:${socket.data.userId}`);
   });
};
