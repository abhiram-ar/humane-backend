import app from '@presentation/http/app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { wsAuth } from './middleware/authMiddleware';
import { onConnectionHandler } from './handlers/onConnectionHandler';
import {
   ClientToServerEvents,
   InterServerEvents,
   ServerToClientEvents,
   SocketData,
} from './Types/SocketIOConfig.types';

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
   httpServer,
   {
      path: '/api/v1/notification/socket.io',
      cors: {
         origin: 'http://localhost:5173', //TODO: better cors in prod
         methods: ['GET', 'POST'],
      },
   }
);

io.use(wsAuth);
io.on('connection', onConnectionHandler);

io.engine.on('connection_error', (err) => {
   console.log(err.req); // the request object
   console.log(err.code); // the error code, for example 1
   console.log(err.message); // the error message, for example "Session ID unknown"
   console.log(err.context); // some additional error context
});

export { io };
export default httpServer;
