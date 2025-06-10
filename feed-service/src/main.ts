import checkEnv from '@config/env';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import connectDB from '@infrastructure/persistance/mongoDB/mongoDBclient';

console.log('feed-src');

const bootstrap = async () => {
   try {
      checkEnv();
      await connectDB();
      await startAllConsumers();
      process.on('SIGINT', async () => {
         await stopAllConsumer();
      });
      process.on('SIGTERM', async () => {
         await stopAllConsumer();
      });

      logger.info('Feed service started succssfully');
   } catch (error) {}
};

bootstrap();
