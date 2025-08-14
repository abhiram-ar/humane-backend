type ENVValue = string | undefined;

type ENVConfig = {
   readonly NODE_ENV: 'production' | 'development';
   readonly SERVER_PORT: ENVValue;
   readonly AWS_ACCESS_KEY: ENVValue;
   readonly AWS_SECRET_KEY: ENVValue;
   readonly AWS_REGION: ENVValue;
   readonly AWS_S3_BUCKET_NAME: ENVValue;
   readonly KAFKA_CLIENT_ID: ENVValue;
   readonly KAFKA_BROKER_URI: ENVValue;
   readonly MEDIA_CONTENT_FLAG_THRESHOLD: ENVValue
};

export const ENV: ENVConfig = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
   AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
   AWS_REGION: process.env.AWS_REGION,
   AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
   KAFKA_BROKER_URI: process.env.KAFKA_BROKER_URI,
   KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
   MEDIA_CONTENT_FLAG_THRESHOLD: process.env.MEDIA_CONTENT_FLAG_THRESHOLD ?? "0.98"
};

function checkEnv() {
   let errorCount = 0;

   for (let key in ENV) {
      let typedKey = key as keyof ENVConfig;
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
