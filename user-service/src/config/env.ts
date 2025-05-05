type ENVValue = string | undefined;

type ENVConfig = {
   readonly NODE_ENV: 'production' | 'development';
   readonly SERVER_PORT: ENVValue;
   readonly PASSWORD_SALT: ENVValue;
   readonly OTP_SALT: ENVValue;
   readonly ACCESS_TOKEN_SECRET: ENVValue;
   readonly REFRESH_TOKEN_SECRET: ENVValue;
   readonly RESET_PASSWORD_SECRET: ENVValue;
   readonly GOOGLE_CLIENT_ID: ENVValue;
   readonly GOOGLE_CLIENT_SECRET: ENVValue;
};

export const ENV: ENVConfig = {
   NODE_ENV: process.env.NODE_ENV as 'production' | 'development',
   SERVER_PORT: '3000',
   PASSWORD_SALT: process.env.passwordSalt || '10',
   OTP_SALT: process.env.otpSalt || '5',
   ACCESS_TOKEN_SECRET: process.env.accessTokenSecret,
   REFRESH_TOKEN_SECRET: process.env.refreshTokenSecret,
   RESET_PASSWORD_SECRET: process.env.resetPasswordTokenSecret,
   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
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
