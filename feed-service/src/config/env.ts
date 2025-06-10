export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
   KAFKA_BROKER_URI: process.env.KAFKA_BROKER_URI,
   ELASTICSEARCH_PROXY_BASE_URL: process.env.ELASTICSEARCH_PROXY_BASE_URL,
   MONGODB_URI: process.env.MONGODB_URI,
} as const;

function checkEnv() {
   let errorCount = 0;

   for (let key in ENV) {
      let typedKey = key as keyof typeof ENV;
      if (ENV[typedKey] === undefined || ENV[typedKey] === null) {
         console.log(`${key} not found in environment`);
         errorCount++;
      }
   }
   if (errorCount > 0) {
      throw new Error('Required envionment variables missing');
   }
}

export default checkEnv;
