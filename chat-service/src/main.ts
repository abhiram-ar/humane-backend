import checkEnv from '@config/env';
import { logger } from '@config/logger';
import httpServer from '@presentation/websocket/ws';

console.log('heleo frm');

const bootStrap = async () => {
   try {
      checkEnv();
      httpServer.listen(3000, () => {
         logger.info('http+socket.io server running on port 3000');
      });
   } catch (error) {
      logger.error('error while starting chat-service-pod');
      console.log(error);
   }
};
bootStrap();
