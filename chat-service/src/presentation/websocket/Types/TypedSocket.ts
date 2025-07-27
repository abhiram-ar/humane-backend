import { Socket } from 'socket.io';
import {
   IClientToServerEvents,
   InterServerEvents,
   IServerToClientEvents,
   SocketData,
} from './SocketIOConfig.types';

export type TypedSocket = Socket<
   IClientToServerEvents,
   IServerToClientEvents,
   InterServerEvents,
   SocketData
>;
