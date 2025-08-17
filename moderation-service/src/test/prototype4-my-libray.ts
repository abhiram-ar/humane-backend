import 'dotenv/config';
import { logger } from '@config/logger';
import { moderationService, nsfwImageClassifierService } from '@di/services.container';
import path from 'path';
import { ENV } from '@config/env';

const bootstrap = async () => {
   try {
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      const res = await moderationService.execute({
         attachmentKey: 'moderation0-test/Aashiq-Banaya.mp4',
         attachmentType: 'video/mp4',
         bucketName: ENV.AWS_S3_BUCKET_NAME as string,
         hotClassNames: ['Porn', 'Hentai'],
         cleanup: true,
      });

      console.log(res);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
