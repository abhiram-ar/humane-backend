import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';

export interface IServerToClientEvents {
   test: (msg: any) => void;
   'new-one-to-one-message': (message: AttachementURLHydratedMessage) => void;
   'message-deleted': (event: {
      message: Required<Message>;
      convoType: Conversation['type'];
   }) => void;
   'update-noti': (noti: unknown) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface IClientToServerEvents {
   hello: () => void;
   'convo-opened': (event: { time: Date; convoId: string }) => void;
   'delete-message': (
      event: { convoId: string; messageId: string },
      callback: (ack: boolean) => void
   ) => void;
   'send-one-to-one-message': (
      event: Omit<CreateOneToOneMessageInputDTO, 'from'>,
      callback: (data: {
         message: AttachementURLHydratedMessage | undefined;
         success: boolean;
      }) => void
   ) => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
