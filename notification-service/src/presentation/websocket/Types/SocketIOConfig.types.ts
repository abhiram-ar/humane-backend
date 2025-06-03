import { CombinedNotification } from '@domain/entities/CombinedNotification';

export interface ServerToClientEvents {
   test: (msg: string) => void;
   'push-noti': (noti: CombinedNotification) => void;
   'remove-noti': (noti: CombinedNotification) => void;
   withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
   hello: () => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
