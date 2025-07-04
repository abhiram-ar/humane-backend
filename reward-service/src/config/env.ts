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
   readonly AWS_ACCESS_KEY: ENVValue;
   readonly AWS_SECRET_KEY: ENVValue;
   readonly AWS_REGION: ENVValue;
   readonly AWS_S3_BUCKET_NAME: ENVValue;
   readonly AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME: ENVValue;
   readonly ELASTICSEARCH_PROXY_BASE_URL: ENVValue
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
   AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
   AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
   AWS_REGION: process.env.AWS_REGION,
   AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
   AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME: process.env.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME,
   ELASTICSEARCH_PROXY_BASE_URL: process.env.ELASTICSEARCH_PROXY_BASE_URL
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
