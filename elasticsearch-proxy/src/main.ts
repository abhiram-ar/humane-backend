import { esClient, pingES } from '@config/esClient';
import { userRepository } from '@di/repository';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';

const bootstrap = async () => {
   try {
      await userRepository.initializeUserIndex();
      await startAllConsumers();
      process.on('SIGINT', () => {
         esClient.close();
         stopAllConsumer();
      });
      process.on('SIGTERM', () => {
         esClient.close();
         stopAllConsumer();
      });
      await pingES();
      logger.info('es proxy-started');
   } catch (error) {
      logger.error('error starting es-proxy');
   }
};

bootstrap();
