import { logger } from '@config/logger';
import { nsfwImageClassifierService } from '@di/services.container';
import path from 'path';
import "dotenv/config"
import { ENV } from '@config/env';

const bootstrap = async () => {
   try {
      // TOOD: add env check
      console.log(ENV.AWS_REGION)
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      const filePath = path.resolve('./test-images/sunny.png');
      const res = await nsfwImageClassifierService.classify({ absImagePath: filePath });
      console.log(res);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
