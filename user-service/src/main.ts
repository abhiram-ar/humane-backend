import checkEnv from './config/env';
import app from './presentation/server';
import connectDB from './infrastructure/persistance/mongoDB/client';

const start = async () => {
   try {
      checkEnv();
      await connectDB();

      app.listen(3000, () => console.log('user service start listening on port 3000'));
   } catch (error) {
      console.error('Error while starting user service');
      console.error(error);
   }
};

start();
