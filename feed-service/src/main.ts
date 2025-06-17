import checkEnv from '@config/env';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import { connectRedis, disconnectRedis } from '@infrastructure/cache/redis/client';
import connectDB from '@infrastructure/persistance/mongoDB/mongoDBclient';
import app from '@presentation/http/app';

console.log('feed-src');

const bootstrap = async () => {
   try {
      checkEnv();
      await connectDB();
      await connectRedis();
      await startAllConsumers();
      process.on('SIGINT', async () => {
         disconnectRedis();
         await stopAllConsumer();
      });
      process.on('SIGTERM', async () => {
         disconnectRedis();
         await stopAllConsumer();
      });

      app.listen(3000, () => {
         logger.info('feed server started lisign on port 3000');
      });
      logger.info('Feed service started succssfully');
   } catch (error) {}
};

bootstrap();
