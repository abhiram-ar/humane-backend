import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import checkEnv from '@config/env';
import connectDB from '@infrastructure/persistance/mongo/client';
import httpServer from '@presentation/websocket/ws';

const bootstrap = async () => {
   try {
      checkEnv();
      await connectDB();
      httpServer.listen(3000, () => {
         logger.info('http+socket.io server running on port 3000');
      });

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      await startAllConsumers();

      logger.info('notification service fully operational');
   } catch (error) {
      logger.error('Error while starting notificaion serviec');
      logger.error(error);
   }
};

const shutdown = async () => {
   stopAllConsumer();
};

bootstrap();
