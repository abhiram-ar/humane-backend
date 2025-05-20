console.log('es proxy-started');
import { esClient, pingES } from '@config/esClient';
import { startAllConsumers, stopAllConsumer } from 'consumers/kafka';
import { initializeUserIndex } from 'repository/elasticsearch/userIndex';

const bootstrap = async () => {
   await initializeUserIndex();
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
};

bootstrap();
