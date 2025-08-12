import { logger } from '@config/logger';
import { nsfwImageClassifierService } from '@di/services.container';
import path from 'path';

const bootstrap = async () => {
   try {
      // TOOD: add env check

      const modelPath = path.resolve('./models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel(modelPath);

      const filePath = path.resolve('./test-images/sunny.png');
      const res = await nsfwImageClassifierService.classify({ absImagePath: filePath });
      console.log(res);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
