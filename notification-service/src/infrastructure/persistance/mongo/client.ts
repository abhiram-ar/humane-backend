import mongoose from 'mongoose';

const connectDB = async () => {
   try {
      const status = await mongoose.connect('mongodb://mongo-srv:27017/notificaion');
      console.log(`Database connected: ${status.connection.host} ${status.connection.name}`);
   } catch (error) {
      console.error('Failed to connect to user DB');
      console.error(error);

      console.log(`Trying to reconnect user DB....`);
      setTimeout(connectDB, 5000);
   }
};

export default connectDB;
