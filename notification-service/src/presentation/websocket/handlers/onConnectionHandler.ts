import { logger } from '@config/logger';
import { TypedSocket } from '../Types/TypedSocket';

export const onConnectionHandler = (socket: TypedSocket) => {
   logger.info(`New connection from ${socket.data.userId}`);

   socket.join(socket.data.userId);
   socket.emit('test', `Connected to server, UserId:${socket.data.userId}`);

   socket.on('disconnect', () => {
      logger.debug(`socket disconnected userId:${socket.data.userId}`);
   });
};
