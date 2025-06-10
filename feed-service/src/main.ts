import checkEnv, { ENV } from '@config/env';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import connectDB from '@infrastructure/persistance/mongoDB/mongoDBclient';
import app from '@presentation/http/app';

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

      app.listen(3000, () => {
         logger.info('feed server started lisign on port 3000');
      });
      logger.info('Feed service started succssfully');
   } catch (error) {}
};

bootstrap();
