import { logger } from '@config/logger';
import { TypedSocket } from '../Types/TypedSocket';
import {
   conversationServices,
   mduccProtocolService,
   messageServices,
   oneToOneCallServices,
   oneToOneMessageServices,
} from '@di/usecases.container';
import { ClientEventHandler } from './ClientEventHandler';
import { eventPubliser } from '@di/services.container';

export const onConnectionHandler = (socket: TypedSocket) => {
   logger.info(`New connection from ${socket.data.userId}`);

   socket.join(socket.data.userId);
   socket.emit('test', `Connected to server, UserId:${socket.data.userId}`);

   // TODO: replace with factory
   const clientEventHandler = new ClientEventHandler(
      socket,
      conversationServices,
      oneToOneMessageServices,
      messageServices,
      eventPubliser,
      oneToOneCallServices,
      mduccProtocolService
   );

   socket.on('hello', clientEventHandler.hello);

   socket.on('send-one-to-one-message', clientEventHandler['send-one-to-one-message']);

   socket.on('convo-opened', clientEventHandler['convo-opened']);

   socket.on('delete-one-to-one-message', clientEventHandler['delete-one-to-one-message']);

   socket.on('is-user-online', clientEventHandler['is-user-online']);

   socket.on('typing-one-to-one-message', clientEventHandler['typing-one-to-one-message']);

   //call events
   socket.on('call.initiate', clientEventHandler['call.initiate']);

   socket.on('call.action', clientEventHandler['call.action']);

   socket.on('call.handup', clientEventHandler['call.handup']);

   socket.on('call.sdp.offer', clientEventHandler['call.sdp.offer']);

   socket.on('call.sdp.answer', clientEventHandler['call.sdp.answer']);

   socket.on('call.ice-candidates', clientEventHandler['call.ice-candidates']);

   socket.on('call.media.state', clientEventHandler['call.media.state']);

   socket.on('disconnect', () => {
      logger.debug(`socket disconnected userId:${socket.data.userId}`);
   });
};
