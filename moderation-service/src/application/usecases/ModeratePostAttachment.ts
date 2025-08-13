import { INSFWJSImageClassifierService } from '@application/port/INSFWImageClassifierService';
import { IStorageService } from '@application/port/IStorageService';
import { IVideoService } from '@application/port/IVideoService';
import { logger } from '@config/logger';
import path from 'path';
import fs from 'fs';
import { readdir, rm } from 'fs/promises';
import { Prediction } from '@domain/Prediction';
import { ENV } from '@config/env';

export class ModerateMedia<ClassNames extends string> {
   constructor(
      private readonly _nsfwImageClassifierService: INSFWJSImageClassifierService<ClassNames>,
      private readonly _storeageService: IStorageService,
      protected readonly _videoServices: IVideoService,
      public readonly tempDownloadPath: string = path.resolve('./temp')
   ) {}

   execute = async (dto: {
      attachmentType: string;
      attachmentKey: string;
      bucketName: string;
      hotClassNames: ClassNames[];
      cleanup?: boolean;
   }): Promise<
      | { success: false }
      | {
           success: true;
           moderdationData: Prediction<ClassNames>[];
           flagged: boolean;
           tempResourceName?: string;
        }
   > => {
      const tempResourceName = crypto.randomUUID();

      try {
         const download = await this._storeageService.getObject({
            key: dto.attachmentKey,
            bucket: dto.bucketName,
            tempFileName: tempResourceName,
            saveDirPath: path.join(this.tempDownloadPath, tempResourceName),
         });

         if (!download.ok) {
            logger.warn('not downloaded');
            return { success: false };
         }

         let result: Prediction<ClassNames>[] | null;
         if (dto.attachmentType.toLowerCase().startsWith('image')) {
            result = await this._nsfwImageClassifierService.classify({
               absImagePath: download.fullFilePath,
            });
            console.log(result);
         } else if (dto.attachmentType.toLowerCase().startsWith('video')) {
            result = await this.handleVideoFrameClassification({
               tempResourceName,
               absFilePath: download.fullFilePath,
               hotClassNames: dto.hotClassNames,
            });
         } else {
            logger.warn(`${ModerateMedia.name}: un-supported media`);
            return { success: false };
         }
         
         if (!result) {
            logger.debug(`${ModerateMedia.name}: no moderation result, skipping`);
            return { success: false };
         }

         if (dto.cleanup) {
            await this.cleanup(tempResourceName);
         }

         return {
            success: true,
            flagged: this.isContentFlagged(result, dto.hotClassNames),
            moderdationData: result,
            tempResourceName: !dto.cleanup ? tempResourceName : undefined,
         };
      } catch (err) {
         await this.cleanup(tempResourceName);
         throw err;
      }
   };

   handleVideoFrameClassification = async (dto: {
      tempResourceName: string;
      absFilePath: string;
      hotClassNames: ClassNames[];
   }): Promise<Prediction<ClassNames>[] | null> => {
      const outputDir = path.join(this.tempDownloadPath, dto.tempResourceName, 'frames');
      const { ok, error } = await this._videoServices.extractFrames({
         videoPath: dto.absFilePath,
         outputDir,
         fps: 1,
      });

      if (!ok) {
         logger.warn('unable to extract frames');
         console.log(error);
         return null;
      }

      if (!fs.existsSync(outputDir)) {
         logger.warn('no video frame output folder found');
         return null;
      }

      const frameFiles = await readdir(outputDir);

      let completed = 0;
      const promises = frameFiles.map(async (frameFile) => {
         const fullPath = path.join(outputDir, frameFile);
         const res = await this._nsfwImageClassifierService.classify({
            absImagePath: fullPath,
         });
         logger.debug(`classified ${++completed}/${frameFiles.length} video frames`);
         return res;
      });

      const frameClassificationResult = await Promise.all(promises);

      let largestHotClassPropability = 0;
      let hotestFrameIdx = 0;

      frameClassificationResult.forEach((res, idx) => {
         if (!res) return;
         res.forEach((prediction) => {
            if (
               dto.hotClassNames.includes(prediction.className) &&
               prediction.probability > largestHotClassPropability
            ) {
               largestHotClassPropability = prediction.probability;
               hotestFrameIdx = idx;
            }
         });
      });
      return frameClassificationResult[hotestFrameIdx] as unknown as Prediction<ClassNames>[];
   };

   isContentFlagged = (predictions: Prediction<ClassNames>[], hotFields: ClassNames[]): boolean => {
      const flagThreshold = parseFloat(ENV.MEDIA_CONTENT_FLAG_THRESHOLD as string);

      for (const prediction of predictions) {
         if (hotFields.includes(prediction.className) && prediction.probability > flagThreshold) {
            return true;
         }
      }

      return false;
   };

   cleanup = async (tempResourceName: string) => {
      try {
         const resoureDir = path.join(this.tempDownloadPath, tempResourceName);
         if (resoureDir && fs.existsSync(resoureDir)) {
            // logger.warn(`removving ${resoureDir}`)
            await rm(resoureDir, { recursive: true });
         }
      } catch (error) {
         logger.error(error);
      }
   };
}
