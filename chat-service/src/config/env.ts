export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   MONGODB_URI: process.env.MONGODB_URI,
   ELASTICSEARCH_PROXY_BASE_URL: process.env.ELASTICSEARCH_PROXY_BASE_URL,
   AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME: process.env.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME,
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
