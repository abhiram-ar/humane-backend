import { ENV } from '@config/env';

export class CDNService {
   constructor() {}

   getPublicCDNURL(key: string): string {
      return `${ENV.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}/${key}`;
   }
}
