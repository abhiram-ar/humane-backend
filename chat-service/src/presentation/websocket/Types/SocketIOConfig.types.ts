import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';

export interface ServerToClientEvents {
   test: (msg: any) => void;
   'push-noti': (noti: unknown) => void;
   'remove-noti': (noti: unknown) => void;
   'update-noti': (noti: unknown) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
   hello: () => void;
   'send-one-to-one-message': (dto: Omit<CreateOneToOneMessageInputDTO, 'from'>) => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
