import { S3Client } from '@aws-sdk/client-s3';
import { ENV } from '@config/env';

const s3Client = new S3Client({
   region: ENV.AWS_REGION,
   credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY as string,
      secretAccessKey: ENV.AWS_SECRET_KEY as string,
   },
});

export default s3Client;
