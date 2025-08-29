import { logger } from './logger';

export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   POSTGRES_URI: process.env.POSTGRES_URI,
   USER_SERVICE_BASE_URL: process.env.USER_SERVICE_BASE_URL,
   CHAT_REWARED_COOLOFF_INTERFVAL: process.env.CHAT_REWARED_COOLOFF_INTERFVAL ?? '86400000', // 24hrs
   ELASTICSEARCH_PROXY_BASE_URL: process.env.ELASTICSEARCH_PROXY_BASE_URL,
};

function checkEnv() {
   let errorCount = 0;

   for (let key in ENV) {
      let typedKey = key as keyof typeof ENV;
      if (ENV[typedKey] === undefined || ENV[typedKey] === null) {
         logger.error(`${key} not found in environment`);
         errorCount++;
      }
   }
   if (errorCount > 0) {
      throw new Error('Required envionment variables missing');
   }
}

export default checkEnv;
