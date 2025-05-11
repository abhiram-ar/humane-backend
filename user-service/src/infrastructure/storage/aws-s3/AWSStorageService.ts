import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@config/env';
import { IStorageService } from '@ports/IStorageService';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from './s3-client';

export class AWSStorageService implements IStorageService {
   generatePreSignedURL = async (key: string, mimeType: string): Promise<string | null> => {
      try {
         const command = new PutObjectCommand({
            Bucket: ENV.AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: mimeType,
         });

         return await getSignedUrl(s3Client, command, {
            expiresIn: 1800, // 30min
         });
      } catch (error) {
         console.log('Error while generating presigned url', error);
         return null;
      }
   };
}
