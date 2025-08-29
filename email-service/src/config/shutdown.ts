import { disconnectKafkaProducer, stopAllConsumers } from './kafka';
import { logger } from './logger';

export const shutdownCleanup = async () => {
   await disconnectKafkaProducer();

   logger.debug('🔻Gracefully shutting down consumers...');
   await stopAllConsumers();

   process.exit(0);
};
