import { verifyAccessToken } from '@config/jwt';
import { ExtendedError, Socket } from 'socket.io';

export const wsAuth = (socket: Socket, next: (err?: ExtendedError) => void) => {
   const accessToken = socket.handshake.query.token as string; // dev
   // const accessToken = socket.handshake.auth.token as string; // prod

   if (!accessToken) {
      return next(new Error('No token in socket.io request'));
   }
   try {
      const payload = verifyAccessToken.execute(accessToken);

      if (payload.type === 'user') {
         socket.data.userId = payload.userId;
         next();
      } else {
         next(new Error('Invalid user type while verifying accessToken'));
      }
   } catch (error) {
      next(error as Error);
   }
};
