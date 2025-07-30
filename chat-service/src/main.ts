import checkEnv from '@config/env';
import { connectKafkaProducer, disconnectKafkaProducer } from '@config/kafka';
import { logger } from '@config/logger';
import connectDB from '@infrastructure/persistance/mongo/client';
import httpServer from '@presentation/websocket/ws';

const bootStrap = async () => {
   try {
      checkEnv();
      await connectDB();
      await connectKafkaProducer();
      httpServer.listen(3000, () => {
         logger.info('http+socket.io server running on port 3000');
      });

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
   } catch (error) {
      logger.error('error while starting chat-service-pod');
      console.log(error);
   }
};

const shutdown = async () => {
   disconnectKafkaProducer();
};

bootStrap();
