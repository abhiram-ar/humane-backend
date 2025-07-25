import { logger } from '@config/logger';
import { TypedSocket } from '../Types/TypedSocket';
import { sendOneToOneMessageHandler } from './sendOneToOneMessage.handler';
import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { conversationServices } from '@di/usecases.container';
import {
   SetConvoLastOpenedInputDTO,
   setConvoLastOpenedInputSchema,
} from '@application/dto/SetCovoLastOpened.dto';
import { ZodValidationError } from 'humane-common';

export const onConnectionHandler = (socket: TypedSocket) => {
   logger.info(`New connection from ${socket.data.userId}`);

   socket.join(socket.data.userId);
   socket.emit('test', `Connected to server, UserId:${socket.data.userId}`);

   socket.on('hello', () => {
      console.log('client say hello');
   });

   socket.on('send-one-to-one-message', (event: Omit<CreateOneToOneMessageInputDTO, 'from'>, cb) =>
      sendOneToOneMessageHandler(socket, event, cb)
   );

   socket.on('convo-opened', async ({ time, convoId }) => {
      try {
         const userId = socket.data.userId;

         const dto: SetConvoLastOpenedInputDTO = {
            conversationId: convoId,
            time: new Date(time),
            userId,
         };

         const validtedDTO = setConvoLastOpenedInputSchema.safeParse(dto);

         if (!validtedDTO.success) {
            throw new ZodValidationError(validtedDTO.error);
         }

         await conversationServices.setLastOpenedAt({ userId, time, conversationId: convoId });
         
      } catch (error) {
         logger.error('error while setting convo opened');
         console.log(error);
      }
   });

   socket.on('disconnect', () => {
      logger.debug(`socket disconnected userId:${socket.data.userId}`);
   });
};
