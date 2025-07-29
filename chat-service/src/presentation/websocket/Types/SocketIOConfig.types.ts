import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';

export interface IServerToClientEvents {
   test: (msg: any) => void;

   'new-one-to-one-message': (
      message: AttachementURLHydratedMessage,
      participants: Conversation['participants']
   ) => void;

   'one-to-one-message-deleted': (event: {
      message: Required<Message>;
      participants: Conversation['participants'];
   }) => void;

   'typing-one-to-one-message': (event: {
      typingUser: string;
      convoId: string;
      time: Date;
   }) => void;

   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface IClientToServerEvents {
   hello: () => void;
   'convo-opened': (event: { time: Date; convoId: string }) => void;

   'delete-one-to-one-message': (
      event: { otherUserId: string; messageId: string },
      callback: (ack: boolean) => void
   ) => void;

   'send-one-to-one-message': (
      event: Omit<CreateOneToOneMessageInputDTO, 'from'>,
      callback: (data: {
         message: AttachementURLHydratedMessage | undefined;
         success: boolean;
      }) => void
   ) => void;

   'is-user-online': (userId: string, callback: (ack: boolean) => void) => void;

   'typing-one-to-one-message': (event: {
      otherUserId: string;
      convoId: string;
      time: Date;
   }) => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
