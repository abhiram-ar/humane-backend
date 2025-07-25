import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { AttachementURLHydratedMessage } from '@application/Types/AttachmentURLHydratedMessage';

export interface ServerToClientEvents {
   test: (msg: any) => void;
   'new-one-to-one-message': (message: AttachementURLHydratedMessage) => void;
   'remove-noti': (noti: unknown) => void;
   'update-noti': (noti: unknown) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
   hello: () => void;
   'convo-opened': (dto: { time: Date; convoId: string }) => void;
   'send-one-to-one-message': (
      dto: Omit<CreateOneToOneMessageInputDTO, 'from'>,
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
