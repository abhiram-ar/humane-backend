import { disconnectKafkaProducer, stopAllConsumers } from './kafka';

export const shutdownCleanup = async () => {
   await disconnectKafkaProducer();

   console.log('🔻Gracefully shutting down consumers...');
   await stopAllConsumers();

   process.exit(0);
};
