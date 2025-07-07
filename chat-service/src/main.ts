import checkEnv from '@config/env';
import { logger } from '@config/logger';
import connectDB from '@infrastructure/persistance/mongo/client';
import httpServer from '@presentation/websocket/ws';

const bootStrap = async () => {
   try {
      checkEnv();
      await connectDB();
      httpServer.listen(3000, () => {
         logger.info('http+socket.io server running on port 3000');
      });
   } catch (error) {
      logger.error('error while starting chat-service-pod');
      console.log(error);
   }
};
bootStrap();
