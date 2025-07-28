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
import { isUserHasMulipleSocketConnected, isUserOnline } from '../utils/isUserOnline';
import { IMessageService } from '@ports/usecases/IMessage.services';
import {
   DeleteUserMessageInputDTO,
   deleteUserMessageSchema,
} from '@application/dto/DeleteUserMessage.dto';
import { ConversationNotFoundError } from '@application/errors/ConversationNotFoundError';

export class ClientEventHandler implements IClientToServerEvents {
   constructor(
      private readonly _clientSocket: TypedSocket,
      private readonly _conversationServices: IConversationServices,
      private readonly _oneToOneMessageSerives: IOneToOneMessageServices,
      private readonly _messageServices: IMessageService
   ) {}
   'is-user-online' = async (userId: string, callback: (ack: boolean) => void) => {
      try {
         const userOnlineStatus = await isUserOnline(userId);
         callback(userOnlineStatus);
      } catch (error) {
         logger.error(error);
         callback(false);
      }
   };

   'delete-one-to-one-message' = async (
      eventPayload: { otherUserId: string; messageId: string },
      callback: (ack: boolean) => void
   ) => {
      try {
         const dto: DeleteUserMessageInputDTO = {
            userId: this._clientSocket.data.userId,
            messageId: eventPayload.messageId,
         };
         const validatedDTO = deleteUserMessageSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         const convo = await this._conversationServices.getOneToOneConversationByParticipantIds([
            validatedDTO.data.userId,
            eventPayload.otherUserId,
         ]);
         if (!convo) {
            throw new ConversationNotFoundError();
         }

         const deletedMessage = await this._messageServices.softDeleteUserMessage(
            validatedDTO.data
         );

         const deleteMessageFromOtherUserPromises = convo.participants.map(async (user) => {
            console.log('emmit', user.userId);
            if (await isUserOnline(user.userId)) {
               this._clientSocket.to(user.userId).emit('one-to-one-message-deleted', {
                  message: deletedMessage,
                  participants: convo.participants,
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

         const { message, convo } = await this._oneToOneMessageSerives.create(validatedDTO.data);
         if (await isUserOnline(event.to)) {
            this._clientSocket
               .to(event.to)
               .emit('new-one-to-one-message', message, convo.participants);
         }

         if (await isUserHasMulipleSocketConnected(message.senderId)) {
            this._clientSocket
               .to(message.senderId)
               .emit('new-one-to-one-message', message, convo.participants);
         }

         callback({ message: message, success: true });
      } catch (e) {
         console.log('error while one to one message');
         console.log(e);
         callback({ message: undefined, success: false });
      }
   };

   'typing-one-to-one-message' = async (event: { otherUserId: string; convoId: string }) => {
      if (await isUserOnline(event.otherUserId)) {
         const typingUser = this._clientSocket.data.userId;
         this._clientSocket
            .to(event.otherUserId)
            .emit('typing-one-to-one-message', { typingUser, convoId: event.convoId });
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
