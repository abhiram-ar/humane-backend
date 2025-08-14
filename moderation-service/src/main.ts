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

      logger.info('starting job');
      let res = await moderationService.execute({
         attachmentKey: 'moderation0-test/tauta-tauba-song.mp4',
         attachmentType: 'video/mp4',
         bucketName: ENV.AWS_S3_BUCKET_NAME as string,
         hotClassNames: ['Porn', 'Hentai'],
         cleanup: true,
      });
      console.log(res);
      if (res.success && res.moderdationData.type === 'multiFrame')
         console.log(res.moderdationData.result.hotFrames.length);
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
