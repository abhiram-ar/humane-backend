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
         origin: ['http://localhost:5173', 'https://humane.abhiram-ar.com'], //TODO: better cors in prod
         credentials: true, // required
      },
   }
);

io.use(wsAuth);
io.on('connection', onConnectionHandler);

io.engine.on('connection_error', (err) => {
   console.log(err);
});

export { io };
export default httpServer;
