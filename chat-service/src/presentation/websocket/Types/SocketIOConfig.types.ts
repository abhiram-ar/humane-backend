import { IClientToServerCallEvents, IServerToClientCallEvents } from './ICallEvents';
import { IClientToServerChatEvents, IServerToClientChatEvents } from './IChatEvents';

export interface IServerToClientEvents
   extends IServerToClientChatEvents,
      IServerToClientCallEvents {
   test: (msg: any) => void;
}

export interface IClientToServerEvents
   extends IClientToServerChatEvents,
      IClientToServerCallEvents {
   hello: () => void;
}

export interface InterServerEvents {
   ping: () => void;
}

export interface SocketData {
   userId: string;
}
