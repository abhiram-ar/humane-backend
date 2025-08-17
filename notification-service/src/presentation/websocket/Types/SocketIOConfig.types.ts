import { CombinedNotification } from '@domain/entities/CombinedNotification';
import { CombinedNotificationWithActionableUser } from '@presentation/Types/CombinedNotiWithActionableUser';
import { ModerationStatus } from 'humane-common';

export interface ServerToClientEvents {
   test: (msg: string) => void;
   'push-noti': (noti: CombinedNotificationWithActionableUser) => void;
   'remove-noti': (noti: CombinedNotification) => void;
   'update-noti': (noti: CombinedNotificationWithActionableUser) => void;
   'post-moderation-completed': (
      postId: string,
      status: (typeof ModerationStatus)[keyof typeof ModerationStatus]
   ) => void;
   'user-rewarded': (amount: number, rewardedAt: string) => void;
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
