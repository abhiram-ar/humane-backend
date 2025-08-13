import { INSFWJSImageClassifierService } from '@application/port/INSFWImageClassifierService';
import { IStorageService } from '@application/port/IStorageService';
import { logger } from '@config/logger';
import path from 'path';
export class ModerateMediaService {
   constructor(
      private readonly _nsfwImageClassifierService: INSFWJSImageClassifierService,
      private readonly _storeageService: IStorageService,

      public readonly tempDownloadPath: string = '/home/abhiram/Bootcamp/week-23-to-27/humane/backend/moderation-service/temp'
   ) {}

   execute = async (dto: { attachmentType: string; attachmentKey: string; bucketName: string }) => {
      const tempResourceName = crypto.randomUUID();

      const download = await this._storeageService.getObject({
         key: dto.attachmentKey,
         bucket: dto.bucketName,
         tempFileName: tempResourceName,
         saveDirPath: path.join(this.tempDownloadPath, tempResourceName),
      });

      if (!download.ok) {
         logger.warn('not downloaded');
         return;
      }

      if (dto.attachmentType.toLowerCase().startsWith('image')) {
         const res = await this._nsfwImageClassifierService.classify({
            absImagePath: download.fullFilePath,
         });
         console.log(res);
      } else if (dto.attachmentType.toLowerCase().startsWith('video')) {
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
   };

   image = () => {};

   video = () => {};
}
