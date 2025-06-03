type ENVValue = string | undefined;

type ENVConfig = {
   readonly NODE_ENV: 'production' | 'development';
   readonly SERVER_PORT: ENVValue;
   readonly ACCESS_TOKEN_SECRET: ENVValue;
   readonly KAFKA_CLIENT_ID: ENVValue;
   readonly KAFKA_BROKER_URI: ENVValue;
};

export const ENV: ENVConfig = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
   KAFKA_BROKER_URI: process.env.KAFKA_BROKER_URI,
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
