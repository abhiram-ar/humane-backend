import 'dotenv/config';
import { logger } from '@config/logger';
import { moderationService, nsfwImageClassifierService } from '@di/services.container';
import path from 'path';
import { ENV } from '@config/env';

const bootstrap = async () => {
   try {
      // TOOD: add env check
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      let res = await moderationService.execute({
         attachmentKey:
            "4208d67b-1af8-488b-97e7-a719d632af33/1753265225060-mariasibyyy's2025-3-9-19.13.542 story.mp4",
         attachmentType: 'video/mp4',
         bucketName: ENV.AWS_S3_BUCKET_NAME as string,
         hotClassNames: ["Porn", "Hentai"],
      });
      console.log(res);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};


bootstrap();
