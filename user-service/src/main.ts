import { logger } from '@config/logger';
import checkEnv from './config/env';
import app from './presentation/server';
import { connectKafkaProducer, disconnectKafkaProducer } from '@config/kafka';
import db from '@infrastructure/persistance/postgres/prisma-client';

const start = async () => {
   try {
      checkEnv();
      await db.$connect();

      await connectKafkaProducer();
      process.on('SIGINT', async () => {
         await disconnectKafkaProducer();
      });
      process.on('SIGTERM', async () => {
         await disconnectKafkaProducer();
      });

      app.listen(3000, () => logger.info('user service start listening on port 3000'));
   } catch (error) {
      logger.error('Error while starting user service', { error });
   }
};
console.log("ho")
start();
