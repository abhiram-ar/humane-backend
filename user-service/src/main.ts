import checkEnv from './config/env';
import app from './presentation/server';
import connectDB from './infrastructure/persistance/mongoDB/client';
import { connectKafkaProducer, disconnectKafkaProducer } from '@config/kafka';

const start = async () => {
   try {
      checkEnv();

      await connectDB();

      await connectKafkaProducer();
      process.on('SIGINT', async () => {
         await disconnectKafkaProducer();
      });

      app.listen(3000, () => console.log('user service start listening on port 3000'));
   } catch (error) {
      console.error('Error while starting user service');
      console.error(error);
   }
};

start();
