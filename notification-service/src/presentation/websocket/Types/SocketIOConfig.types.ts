import { CombinedNotification } from '@domain/entities/CombinedNotification';
import { CombinedNotificationWithActionableUser } from '@presentation/Types/CombinedNotiWithActionableUser';

export interface ServerToClientEvents {
   test: (msg: string) => void;
   'push-noti': (noti: CombinedNotificationWithActionableUser) => void;
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
