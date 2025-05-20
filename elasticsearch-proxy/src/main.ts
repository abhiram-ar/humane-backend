console.log('es proxy-started');
import { esClient, pingES } from '@config/esClient';
import { initializeUserIndex } from 'repository/elasticsearch/userIndex';

const bootstrap = async () => {
   await initializeUserIndex();
   process.on('SIGINT', () => esClient.close());
   process.on('SIGTERM', () => esClient.close());
   await pingES();
};

bootstrap();
