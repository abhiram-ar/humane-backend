export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
   KAFKA_BROKER_URI: process.env.KAFKA_BROKER_URI,
   MONGODB_URI: process.env.MONGODB_URI,
   AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
   AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
   AWS_REGION: process.env.AWS_REGION,
   AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
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
