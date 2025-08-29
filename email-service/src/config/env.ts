import { logger } from "./logger";

type ENVValue = string | undefined;

type ENVConfig = {
   readonly NODE_ENV: 'production' | 'development';
   readonly SERVER_PORT: ENVValue;
   readonly ACCESS_TOKEN_SECRET: ENVValue;
   readonly REFRESH_TOKEN_SECRET: ENVValue;
   readonly SMTP_HOST: ENVValue;
   readonly SMTP_PORT: ENVValue;
   readonly SMTP_SERVICE: ENVValue;
   readonly SMTP_MAIL: ENVValue;
   readonly SMTP_PASSWORD: ENVValue;
};

export const ENV: ENVConfig = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   REFRESH_TOKEN_SECRET: process.env.refreshTokenSecret,
   SMTP_HOST: process.env.SMTP_HOST,
   SMTP_PORT: process.env.SMTP_PORT,
   SMTP_SERVICE: process.env.SMTP_SERVICE,
   SMTP_MAIL: process.env.SMTP_MAIL,
   SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};

function checkEnv() {
   let errorCount = 0;

   for (let key in ENV) {
      let typedKey = key as keyof ENVConfig;
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
