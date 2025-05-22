import { userRepository } from '@di/repository';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import app from 'app';

const bootstrap = async () => {
   try {
      await userRepository.initializeUserIndex();

      await startAllConsumers();
      process.on('SIGINT', () => {
         userRepository.client.close();
         stopAllConsumer();
      });
      process.on('SIGTERM', () => {
         userRepository.client.close();
         stopAllConsumer();
      });
      await userRepository.pingES();

      app.listen(3000, () => {
         logger.info('es-proxy started');
         console.log("hello")
      });
   } catch (error) {
      logger.error('error starting es-proxy');
   }
};

bootstrap();
