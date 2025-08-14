import 'dotenv/config';
import { logger } from '@config/logger';
import { nsfwImageClassifierService, videoService } from '@di/services.container';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { ENV } from '@config/env';
import os from 'os';

const bootstrap = async () => {
   try {
      console.log(ENV.AWS_REGION);
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      const outputDir =
         '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp/tauba-tauba-song/frames';

      const { ok, error } = await videoService.extractFrames({
         videoPath:
            '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp/prn1.mp4',
         outputDir,
         fps: 1,
      });

      if (!ok) {
         logger.warn('unable to extract frames');
         console.log(error);
         return;
      }

      if (fs.existsSync(outputDir)) {
         const frameFiles = await readdir(outputDir);
         const promises = frameFiles.map(async (frameFile, idx) => {
            const fullPath = path.join(outputDir, frameFile);
            const res = await nsfwImageClassifierService.classify({ absImagePath: fullPath });
            logger.debug(`classified ${idx + 1}/${frameFiles.length} video frames`);
            console.log(res);
            fs.writeFileSync(
               '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp/prn2.txt',
               JSON.stringify({ time: idx + 1, res }) + os.EOL,
               { flag: 'a' }
            );

            return res;
         });

         const result = await Promise.all(promises);
         let max = 0;
         let maxIdx = 0;
         let explicitframes: any[] = [];
         result.forEach((res, idx) => {
            if (!res) return;
            res.forEach((prediction) => {
               if (prediction.className === 'Porn' && prediction.probability > max) {
                  max = prediction.probability;
                  maxIdx = idx;
               }

               if (prediction.className === 'Porn' && prediction.probability > 0.98) {
                  explicitframes.push(res);
               }
            });
         });
         console.log('most explicit frame', maxIdx + 1);
         console.log(result[maxIdx]);
         console.log('\n');

         console.log(`eplicit frames ${explicitframes.length}/${result.length}`);
      }
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
