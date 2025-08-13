import 'dotenv/config';
import { logger } from '@config/logger';
import { nsfwImageClassifierService } from '@di/services.container';
import path from 'path';
import { ENV } from '@config/env';

const bootstrap = async () => {
   try {
      console.log(ENV.AWS_REGION);
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      const res = await nsfwImageClassifierService.classify({
         absImagePath:
            '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp/prn2/frames/frame-000236.jpg',
      });
      console.log(res);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
