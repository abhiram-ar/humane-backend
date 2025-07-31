import checkEnv from '@config/env';
import {
   connectKafkaProducer,
   disconnectKafkaProducer,
   startAllConsumer,
   stopAllConsumer,
} from '@config/kafka';
import { logger } from '@config/logger';
import { connectRedis, disconnectRedis } from '@infrastructure/cache/redis/client';
import connectDB from '@infrastructure/persistance/mongo/client';
import httpServer from '@presentation/websocket/ws';

const bootStrap = async () => {
   try {
      checkEnv();
      await connectDB();
      await connectRedis();
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      await connectKafkaProducer();

      httpServer.listen(3000, () => {
         logger.info('http+socket.io server running on port 3000');
      });

      await startAllConsumer();
   } catch (error) {
      logger.error('error while starting chat-service-pod');
      console.log(error);
   }
};

const shutdown = async () => {
   disconnectKafkaProducer();
   stopAllConsumer();
   disconnectRedis();
};

bootStrap();
