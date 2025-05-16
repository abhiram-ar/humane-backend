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

      app.listen(3000, () => console.log('user service start listening on port 3000'));
   } catch (error) {
      console.error('Error while starting user service');
      console.error(error);
   }
};

start();
