import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';

const bootstrap = async () => {
   try {
      await startAllConsumers();
      process.on('SIGINT', async () => {
         await stopAllConsumer();
      });
      process.on('SIGTERM', async () => {
         await stopAllConsumer();
      });
      logger.info('notification service started successfuly');
   } catch (error) {
      logger.error('Error while starting notificaion serviec');
      logger.error(error);
   }
};
bootstrap();
