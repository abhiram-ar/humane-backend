import { Client } from '@elastic/elasticsearch';
import { ENV } from './env';

export const esClient = new Client({ node: ENV.ELASTICSEARCH_URI });

export const pingES = async () => {
   try {
      const health = await esClient.cluster.health();
      console.log('cluster health', health);
   } catch (error) {
      console.log('error pingitg es cluster', error);
   }
};

