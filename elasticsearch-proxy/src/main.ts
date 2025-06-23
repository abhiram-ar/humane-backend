import { commentRepository, postRepository, userRepository } from '@di/repository';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import app from 'app';
import { esClient } from '@config/esClient';

const bootstrap = async () => {
   try {
      await userRepository.initializeUserIndex();
      await postRepository.initializePostIndex();
      await commentRepository.initializeCommentIndex();

      app.listen(3000, () => {
         logger.info('es-proxy server started');
      });

      await startAllConsumers();
      process.on('SIGINT', () => {
         esClient.close();
         stopAllConsumer();
      });
      process.on('SIGTERM', () => {
         esClient.close();
         stopAllConsumer();
      });
      await userRepository.pingES();
      logger.info('es proxy full operational');
   } catch (error) {
      logger.error('error starting es-proxy');
   }
};

bootstrap();
