import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '@config/env';
import { IStorageService } from '@ports/IStorageService';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from './s3-client';

export class AWSStorageService implements IStorageService {
   generatePreSignedURL = async (
      userId: string,
      key: string,
      mimeType: string
   ): Promise<{ preSignedURL: string; key: string } | null> => {
      try {
         const fullkey = `${userId}/${Date.now()}-${key}`;

         const command = new PutObjectCommand({
            Bucket: ENV.AWS_S3_BUCKET_NAME,
            Key: fullkey,
            ContentType: mimeType,
         });

         const preSignedURL = await getSignedUrl(s3Client, command, {
            expiresIn: 1800, // 30min
         });
         return { preSignedURL, key: fullkey };
      } catch (error) {
         console.log('Error while generating presigned url', error);
         return null;
      }
   };
   getPublicCDNURL(key: string): string {
      return `${ENV.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}/${key}`;
   }
}
