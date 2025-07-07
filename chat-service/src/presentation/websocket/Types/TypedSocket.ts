import { Socket } from 'socket.io';
import {
   ClientToServerEvents,
   InterServerEvents,
   ServerToClientEvents,
   SocketData,
} from './SocketIOConfig.types';

export type TypedSocket = Socket<
   ClientToServerEvents,
   ServerToClientEvents,
   InterServerEvents,
   SocketData
>;
