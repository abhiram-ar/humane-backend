import { ENV } from '@config/env';
import { IStorageService } from '@ports/services/IStorageService';

export class AWSStorageService implements IStorageService {
   getPublicCDNURL(key: string): string {
      return `${ENV.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}/${key}`;
   }
}
