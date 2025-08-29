import { ENV } from '@config/env';
import { logger } from '@config/logget';
import mongoose from 'mongoose';

const connectDB = async () => {
   try {
      const status = await mongoose.connect(ENV.MONGODB_URI as string);
      logger.info(`Database connected: ${status.connection.host} ${status.connection.name}`);
   } catch (error) {
      console.error('Failed to connect to user DB', error);

      logger.warn(`Trying to reconnect user DB....`);
      setTimeout(connectDB, 5000);
   }
};

export default connectDB;
