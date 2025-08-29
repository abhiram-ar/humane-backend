import checkEnv, { ENV } from '@config/env';
import { connectKafkaProducer, startAllConsumers } from '@config/kafka';
import { logger } from '@config/logger';
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

      app.listen(ENV.SERVER_PORT, () => {
         logger.info(`Email service start listening on ${ENV.SERVER_PORT}`);
      });
   } catch (error) {
      logger.error('error while starting notification service', { error });
   }
};

boostrap();
