import {
   SetConvoLastOpenedInputDTO,
   setConvoLastOpenedInputSchema,
} from '@application/dto/SetCovoLastOpened.dto';
import { TypedSocket } from '../Types/TypedSocket';
import { IClientToServerEvents } from '../Types/SocketIOConfig.types';
import { ZodValidationError } from 'humane-common';
import { IConversationServices } from '@ports/usecases/IConversationServices';
import { logger } from '@config/logger';
import {
   CreateOneToOneMessageInputDTO,
   createOneToOneMessageSchema,
} from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { IOneToOneMessageServices } from '@ports/usecases/IOneToOneMessage.services';
import { isUserOnline } from '../utils/isUserOnline';

export class ClientEventHandler implements IClientToServerEvents {
   constructor(
      private readonly _clientSocket: TypedSocket,
      private readonly _conversationServices: IConversationServices,
      private readonly _oneToOneMessageSerives: IOneToOneMessageServices
   ) {}
   'delete-message': (
      dto: { convoId: string; messageId: string },
      callback: (ack: boolean) => void
   ) => void;

   'send-one-to-one-message' = async (
      event: Omit<CreateOneToOneMessageInputDTO, 'from'>,
      callback: (data: {
         message: AttachementURLHydratedMessage | undefined;
         success: boolean;
      }) => void
   ) => {
      try {
         const validatedDTO = createOneToOneMessageSchema.safeParse({
            ...event,
            from: this._clientSocket.data.userId,
         });
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const message = await this._oneToOneMessageSerives.create(validatedDTO.data);
         if (await isUserOnline(event.to)) {
            this._clientSocket.to(event.to).emit('new-one-to-one-message', message);
         }
         callback({ message: message, success: true });
      } catch (e) {
         console.log('error while one to one message');
         console.log(e);
         callback({ message: undefined, success: false });
      }
   };

   'convo-opened' = async (data: { time: Date; convoId: string }) => {
      try {
         const userId = this._clientSocket.data.userId;

         const dto: SetConvoLastOpenedInputDTO = {
            conversationId: data.convoId,
            time: new Date(data.time),
            userId,
         };

         const validtedDTO = setConvoLastOpenedInputSchema.safeParse(dto);

         if (!validtedDTO.success) {
            throw new ZodValidationError(validtedDTO.error);
         }

         await this._conversationServices.setLastOpenedAt({
            userId,
            time: data.time,
            conversationId: data.convoId,
         });
      } catch (error) {
         logger.error('error while setting convo opened');
         console.log(error);
      }
   };
   hello = () => {
      console.log('client say hello');
   };
}
