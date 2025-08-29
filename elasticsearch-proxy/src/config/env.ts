export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   REFRESH_TOKEN_SECRET: process.env.refreshTokenSecret,
   KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
   KAFKA_BROKER_URI: process.env.KAFKA_BROKER_URI,
   ELASTICSEARCH_URI: process.env.ELASTICSEARCH_URI,
   AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME: process.env.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME,
   USER_SERVICE_BASE_URL: process.env.USER_SERVICE_BASE_URL,
} as const;

function checkEnv() {
   let errorCount = 0;

   for (let key in ENV) {
      let typedKey = key as keyof typeof ENV;
      if (ENV[typedKey] === undefined || ENV[typedKey] === null) {
         console.error(`${key} not found in environment`);
         errorCount++;
      }
   }
   if (errorCount > 0) {
      throw new Error('Required envionment variables missing');
   }
}

export default checkEnv;
