import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { Message } from '@domain/Message';

export interface ServerToClientEvents {
   test: (msg: any) => void;
   'new-one-to-one-message': (message: Required<Message>) => void;
   'remove-noti': (noti: unknown) => void;
   'update-noti': (noti: unknown) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
   hello: () => void;
   'send-one-to-one-message': (
      dto: Omit<CreateOneToOneMessageInputDTO, 'from'>,
      callback: (data: { message: Required<Message> | undefined; success: boolean }) => void
   ) => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
