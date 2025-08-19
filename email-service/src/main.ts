import checkEnv from '@config/env';
import { connectKafkaProducer, startAllConsumers } from '@config/kafka';
import { shutdownCleanup } from '@config/shutdown';

const boostrap = async () => {
   try {
      console.log('starting notification service...');
      checkEnv();

      await connectKafkaProducer();
      await startAllConsumers();

      process.on('SIGINT', shutdownCleanup);
      process.on('SIGTERM', shutdownCleanup);
   } catch (error) {
      console.error('error while starting notification service');
      console.error(error);
   }
};

boostrap();
