import checkEnv, { ENV } from '@config/env';
import { connectKafkaProducer, startAllConsumers } from '@config/kafka';
import { shutdownCleanup } from '@config/shutdown';
import app from '@presentation/http/server';

const boostrap = async () => {
   try {
      console.log('starting notification service...');
      checkEnv();

      await connectKafkaProducer();
      await startAllConsumers();

      process.on('SIGINT', shutdownCleanup);
      process.on('SIGTERM', shutdownCleanup);

      app.listen(ENV.SERVER_PORT, () => console.log('nofitcation started on port 3000'));
   } catch (error) {
      console.error('error while starting notification service');
      console.error(error);
   }
};

boostrap();
