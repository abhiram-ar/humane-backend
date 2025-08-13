// @ts-nocheck


import 'dotenv/config';
import { logger } from '@config/logger';
import { nsfwImageClassifierService, storageService, videoService } from '@di/services.container';
import path from 'path';
import { ENV } from '@config/env';
import fs from 'fs';
import { readdir } from 'fs/promises';

const bootstrap = async () => {
   try {
      // TOOD: add env check
      console.log(ENV.AWS_REGION);
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      let type: 'image' | 'video' = 'video';

      const download = await storageService.getObject({
         key: "4208d67b-1af8-488b-97e7-a719d632af33/1753265225060-mariasibyyy's2025-3-9-19.13.542 story.mp4",
         bucket: ENV.AWS_S3_BUCKET_NAME as string,
         tempFileName: 'firsttest3',
         saveDirPath: path.resolve('./temp/'),
      });

      if (!download.ok) {
         logger.warn('not downloaded');
         return;
      }

      // @ts-ignore
      if (type === 'image') {
         const res = await nsfwImageClassifierService.classify({
            absImagePath: download.fullFilePath,
         });
         console.log(res);
      } else {
         const outputDir =
            '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp/frames';

         const { ok, error } = await videoService.extractFrames({
            videoPath: download.fullFilePath,
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
               const res = await nsfwImageClassifierService.classify<
                  'Neutral' | 'Drawing' | 'Hentai' | 'Porn' | 'Sexy'
               >({ absImagePath: fullPath });
               logger.debug(`classified ${idx + 1}/${frameFiles.length} video frames`);
               return res;
            });

            const result = await Promise.all(promises);
            let max = 0;
            let maxIdx = 0;
            result.forEach((res, idx) => {
               if (!res) return;
               res.forEach((prediction) => {
                  if (prediction.className === 'Porn' && prediction.probability > max)
                     max = prediction.probability;
                  maxIdx = idx;
               });
            });
            console.log(result[maxIdx]);
         }
      }
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

bootstrap();
