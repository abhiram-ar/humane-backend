import { commentRepository, postRepository, userRepository } from '@di/repository';
import { startAllConsumers, stopAllConsumer } from '@config/kafka';
import { logger } from '@config/logger';
import app from 'app';
import { esClient } from '@config/esClient';
import checkEnv from '@config/env';

const bootstrap = async () => {
   try {
      checkEnv();
      await userRepository.initializeUserIndex();
      await postRepository.initializePostIndex();
      await commentRepository.initializeCommentIndex();

      app.listen(3000, () => {
         logger.info('es-proxy server started');
      });

      await startAllConsumers();
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      await userRepository.pingES();
      logger.info('es proxy full operational');
   } catch (error) {
      logger.error('error starting es-proxy');
   }
};

const cleanup = () => {
   esClient.close();
   stopAllConsumer();
};

bootstrap();
