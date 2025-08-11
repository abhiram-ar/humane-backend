import {
   SetConvoLastOpenedInputDTO,
   setConvoLastOpenedInputSchema,
} from '@application/dto/SetCovoLastOpened.dto';
import { TypedSocket } from '../Types/TypedSocket';
import { IClientToServerEvents } from '../Types/SocketIOConfig.types';
import {
   AppError,
   AppEventsTypes,
   createEvent,
   GenericError,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
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
import { IEventPublisher } from '@ports/services/IEventProducer';
import { IMDUCCProtocolServices } from '@ports/usecases/IMDUCCProtocol.service';
import { IOneToOneCallServices } from '@ports/usecases/IOneToOneCallServices';
import { createOneToOneCallSchema } from '@application/dto/CreateOneToOneCall.dto';
import { acquireCallRecipientDeviceLockSchema } from '@application/dto/AcquireCallRecipientDeviceLock.dto';
import { CallDescriptionNotFoundError } from '@application/errors/CallDescriptionNotFoundError';
import { HangupCallInputDTO, hangupCallInputSchema } from '@application/dto/HandupCall.dto';
import { CallDeviceNotFoundError } from '@application/errors/CallDeviceNotFoundError';

export class ClientEventHandler implements IClientToServerEvents {
   constructor(
      private readonly _clientSocket: TypedSocket,
      private readonly _conversationServices: IConversationServices,
      private readonly _oneToOneMessageSerives: IOneToOneMessageServices,
      private readonly _messageServices: IMessageService,
      private readonly _eventPublisher: IEventPublisher,
      private readonly _oneToOneCallServices: IOneToOneCallServices,
      private readonly _MDUCCProtocolServices: IMDUCCProtocolServices
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

         // publish the message for furthor processing without keeping the client on wait
         const { attachment, ...data } = message;
         const newMessageEvent = createEvent(AppEventsTypes.NEW_MESSAGE, {
            ...data,
            attachment: validatedDTO.data.attachment,
         });

         await this._eventPublisher.send(MessageBrokerTopics.MESSAGE_EVENTS_TOPIC, newMessageEvent);
      } catch (e) {
         console.log('error while one to one message');
         console.log(e);
         callback({ message: undefined, success: false });
      }
   };

   'typing-one-to-one-message' = async (event: {
      otherUserId: string;
      convoId: string;
      time: Date;
   }) => {
      if (await isUserOnline(event.otherUserId)) {
         const typingUser = this._clientSocket.data.userId;
         this._clientSocket.to(event.otherUserId).emit('typing-one-to-one-message', {
            typingUser,
            convoId: event.convoId,
            time: event.time,
         });
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

   'call.initiate' = async (
      recipientId: string,
      callback: (
         res: { ringing: boolean; callId: string } | { ringing: false; error: string }
      ) => void
   ) => {
      // write to db

      console.log(recipientId, callback);

      try {
         const {
            data: validatedCreateCallDTO,
            error,
            success,
         } = createOneToOneCallSchema.safeParse({
            from: this._clientSocket.data.userId,
            to: recipientId,
         });
         if (!success) {
            throw new ZodValidationError(error);
         }

         // TODO: we can use the convo, to show optimistically update the convo messages
         const { callMessage } = await this._oneToOneCallServices.create(validatedCreateCallDTO);

         const callDescription = await this._MDUCCProtocolServices.initializeCall({
            callId: callMessage.id,
            callerId: validatedCreateCallDTO.from,
            callerDeviceId: this._clientSocket.id,
            recipientId: validatedCreateCallDTO.to,
         });

         const recipientOnline = await isUserOnline(callDescription.recipientId);
         if (recipientOnline) {
            this._clientSocket.to(callDescription.recipientId).emit('call.incoming', {
               callerId: callDescription.callerId,
               callId: callDescription.callId,
               at: callDescription.initiatedAt,
            });
            callback({ ringing: true, callId: callDescription.callId });
         } else {
            callback({ ringing: false, callId: callDescription.callId });
         }
      } catch (error) {
         logger.error(error);
         if (error instanceof AppError) {
            callback({ ringing: false, error: error.message });
         } else {
            callback({ ringing: false, error: 'Error while initiating call' });
         }
      }
   };

   'call.action' = async (
      event: { callId: string; action: 'answered' | 'declined' | 'timeout' },
      callback?: (arg: { status: 'connected' | 'callTakenOnOtherDevice' | 'callEnded' }) => void
   ) => {
      try {
         const {
            data: validatedDTO,
            success,
            error,
         } = acquireCallRecipientDeviceLockSchema.safeParse({
            callId: event.callId,
            recipientDeviceId: this._clientSocket.id,
         });
         if (!success) {
            throw new ZodValidationError(error);
         }

         const { mutex, callDescription } =
            await this._MDUCCProtocolServices.acquireRecipientDeviceLock(validatedDTO);

         if (!mutex) {
            if (event.action === 'answered' && callback) {
               callback({ status: 'callTakenOnOtherDevice' });
            }
            logger.debug('call lock acquired by other user device');
            return;
         }

         if (!callDescription) {
            throw new CallDescriptionNotFoundError();
         }

         // -------------------recipient device acquierd lock--------------------------

         // let other recipient devices know call is acted by this device
         this._clientSocket.to(callDescription.recipientId).emit('call.acted.by_other_device', {
            callId: callDescription.callId,
            callerId: callDescription.callerId,
         });

         // call alreay ended
         if (callDescription.endedAt && callback) {
            callback({ status: 'callEnded' });
         }

         if (event.action === 'answered') {
            await this._oneToOneCallServices.callTaken({ callId: callDescription.callId });
            this._clientSocket.to(callDescription.callerDeviceId).emit('call.connected', {
               callId: callDescription.callId,
               recipientId: callDescription.recipientId,
            });
            if (callback) callback({ status: 'connected' });
         }

         if (event.action === 'declined') {
            await this._MDUCCProtocolServices.hangUpCall({
               callId: callDescription.callId,
               clientDeviceId: this._clientSocket.id,
            });
            this._clientSocket.to(callDescription.callerDeviceId).emit('call.declined', {
               callId: callDescription.callId,
               recipientId: callDescription.recipientId,
            });
         }

         if (event.action === 'timeout') {
            this._MDUCCProtocolServices.hangUpCall({
               callId: callDescription.callId,
               clientDeviceId: this._clientSocket.id,
            });
            this._clientSocket.to(callDescription.callerDeviceId).emit('call.ended', {
               callId: callDescription.callId,
               at: new Date().toUTCString(),
            });
         }
      } catch (error) {
         logger.error(error);
         if (callback) callback({ status: 'callEnded' });
      }
   };

   'call.handup' = async (event: { callId: string }) => {
      try {
         const {
            data: validatedDTO,
            success,
            error,
         } = hangupCallInputSchema.safeParse({
            callId: event.callId,
            clientDeviceId: this._clientSocket.id,
         } as HangupCallInputDTO);
         if (!success) {
            throw new ZodValidationError(error);
         }

         const { handup, callDescription } = await this._MDUCCProtocolServices.hangUpCall(
            validatedDTO
         );

         // user was not able to hangup - or other user hangedup
         if (!handup) return;

         // case 1: call not connected
         if (callDescription && !callDescription.recipientDeviceId) {
            this._clientSocket.to(callDescription.recipientId).emit('call.incoming.cancelled', {
               callerId: callDescription.callerId,
               callId: callDescription.callId,
            });
            return;
         }

         // case 2: call connected
         if (callDescription && callDescription.recipientDeviceId) {
            const currentSocketId = this._clientSocket.id;
            if (currentSocketId === callDescription.callerDeviceId) {
               this._clientSocket.to(callDescription.recipientDeviceId).emit('call.ended', {
                  callId: callDescription.callId,
                  at: callDescription.endedAt ?? new Date().toUTCString(),
               });
            } else if (currentSocketId === callDescription.recipientDeviceId) {
               this._clientSocket.to(callDescription.callerDeviceId).emit('call.ended', {
                  callId: callDescription.callId,
                  at: callDescription.endedAt ?? new Date().toUTCString(),
               });
            }
         }
      } catch (error) {
         logger.error(error);
      }
   };

   'call.ice-candidates' = async (event: { callId: string; ice: string }) => {
      try {
         if (!event.callId) throw new GenericError('No callId');

         const callDesc = await this._MDUCCProtocolServices.getCallDescription(event.callId);
         if (!callDesc) throw new CallDescriptionNotFoundError();

         const currentDeviceId = this._clientSocket.id;
         if (currentDeviceId === callDesc.callerDeviceId) {
            this._clientSocket.to(callDesc.recipientDeviceId!).emit('call.ice-candidates', event);
         } else if (currentDeviceId === callDesc.recipientDeviceId) {
            this._clientSocket.to(callDesc.callerDeviceId).emit('call.ice-candidates', event);
         } else {
            throw new CallDeviceNotFoundError();
         }
      } catch (error) {
         logger.error(error);
      }
   };

   'call.media.state' = async (event: { callId: string; micOn: boolean; videoOn: boolean }) => {
      try {
         if (!event.callId) throw new GenericError('No callId');

         const callDesc = await this._MDUCCProtocolServices.getCallDescription(event.callId);
         if (!callDesc) throw new CallDescriptionNotFoundError();

         const currentDeviceId = this._clientSocket.id;
         if (currentDeviceId === callDesc.callerDeviceId) {
            this._clientSocket.to(callDesc.recipientDeviceId!).emit('call.media.state', event);
         } else if (currentDeviceId === callDesc.recipientDeviceId) {
            this._clientSocket.to(callDesc.callerDeviceId).emit('call.media.state', event);
         } else {
            throw new CallDeviceNotFoundError();
         }
      } catch (error) {
         logger.error(error);
      }
   };

   'call.sdp.offer' = async (event: { callId: string; offerSDP: string }) => {
      try {
         if (!event.callId) throw new GenericError('No callId');

         const callDesc = await this._MDUCCProtocolServices.getCallDescription(event.callId);
         if (!callDesc) throw new CallDescriptionNotFoundError();

         const currentDeviceId = this._clientSocket.id;
         if (currentDeviceId === callDesc.callerDeviceId) {
            this._clientSocket.to(callDesc.recipientDeviceId!).emit('call.sdp.offer', event);
         } else if (currentDeviceId === callDesc.recipientDeviceId) {
            this._clientSocket.to(callDesc.callerDeviceId).emit('call.sdp.offer', event);
         } else {
            throw new CallDeviceNotFoundError();
         }
      } catch (error) {
         logger.error(error);
      }
   };

   'call.sdp.answer' = async (event: { callId: string; answerSDP: string }) => {
      try {
         if (!event.callId) throw new GenericError('No callId');

         const callDesc = await this._MDUCCProtocolServices.getCallDescription(event.callId);
         if (!callDesc) throw new CallDescriptionNotFoundError();

         const currentDeviceId = this._clientSocket.id;
         if (currentDeviceId === callDesc.callerDeviceId) {
            this._clientSocket.to(callDesc.recipientDeviceId!).emit('call.sdp.answer', event);
         } else if (currentDeviceId === callDesc.recipientDeviceId) {
            this._clientSocket.to(callDesc.callerDeviceId).emit('call.sdp.answer', event);
         } else {
            throw new CallDeviceNotFoundError();
         }
      } catch (error) {
         logger.error(error);
      }
   };
}
