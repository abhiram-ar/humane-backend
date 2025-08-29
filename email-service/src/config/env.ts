export const ENV = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   REFRESH_TOKEN_SECRET: process.env.refreshTokenSecret,
   SMTP_HOST: process.env.SMTP_HOST,
   SMTP_PORT: process.env.SMTP_PORT,
   SMTP_SERVICE: process.env.SMTP_SERVICE,
   SMTP_MAIL: process.env.SMTP_MAIL,
   SMTP_PASSWORD: process.env.SMTP_PASSWORD,
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
