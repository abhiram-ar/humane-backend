import { logger } from '@config/logger';
import { TypedSocket } from '../Types/TypedSocket';
import { sendOneToOneMessageHandler } from './sendOneToOneMessage.handler';
import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';

export const onConnectionHandler = (socket: TypedSocket) => {
   logger.info(`New connection from ${socket.data.userId}`);

   socket.join(socket.data.userId);
   socket.emit('test', `Connected to server, UserId:${socket.data.userId}`);

   socket.on('send-one-to-one-message', (event: Omit<CreateOneToOneMessageInputDTO, 'from'>, cb) =>
      sendOneToOneMessageHandler(socket, event, cb)
   );

   socket.on('hello', () => {
      console.log('client say hello');
   });

   socket.on('disconnect', () => {
      logger.debug(`socket disconnected userId:${socket.data.userId}`);
   });
};
