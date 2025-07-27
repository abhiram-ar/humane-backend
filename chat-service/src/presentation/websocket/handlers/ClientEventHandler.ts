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
import { IMessageService } from '@ports/usecases/IMessage.services';
import {
   DeleteUserMessageInputDTO,
   deleteUserMessageSchema,
} from '@application/dto/DeleteUserMessage.dto';

export class ClientEventHandler implements IClientToServerEvents {
   constructor(
      private readonly _clientSocket: TypedSocket,
      private readonly _conversationServices: IConversationServices,
      private readonly _oneToOneMessageSerives: IOneToOneMessageServices,
      private readonly _messageServices: IMessageService
   ) {}
   'delete-message' = async (
      eventPayload: { convoId: string; messageId: string },
      callback: (ack: boolean) => void
   ) => {
      try {
         const dto: DeleteUserMessageInputDTO = {
            userId: this._clientSocket.data.userId,
            convoId: eventPayload.convoId,
            messageId: eventPayload.messageId,
         };
         const validatedDTO = deleteUserMessageSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const deletedMessage = await this._messageServices.deleteUserMessage(validatedDTO.data);

         const convo = await this._conversationServices.getConvoById(validatedDTO.data.convoId);

         const deleteMessageFromOtherUserPromises = convo.participants
            .filter((user) => user.userId !== validatedDTO.data.userId)
            .map(async (user) => {
               if (await isUserOnline(user.userId)) {
                  this._clientSocket.emit('message-deleted', {
                     message: deletedMessage,
                     convoType: convo.type,
                  });
               }
            });

         await Promise.allSettled(deleteMessageFromOtherUserPromises);

         callback(true);
      } catch (error) {
         callback(false);
         logger.error(error);
      }
   };

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

   'convo-opened' = async (event: { time: Date; convoId: string }) => {
      try {
         const userId = this._clientSocket.data.userId;

         const dto: SetConvoLastOpenedInputDTO = {
            conversationId: event.convoId,
            time: new Date(event.time),
            userId,
         };

         const validtedDTO = setConvoLastOpenedInputSchema.safeParse(dto);

         if (!validtedDTO.success) {
            throw new ZodValidationError(validtedDTO.error);
         }

         await this._conversationServices.setLastOpenedAt({
            userId,
            time: event.time,
            conversationId: event.convoId,
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
