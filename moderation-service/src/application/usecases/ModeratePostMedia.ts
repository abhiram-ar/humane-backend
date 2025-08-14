import { INSFWJSImageClassifierService } from '@application/port/INSFWImageClassifierService';
import { IStorageService } from '@application/port/IStorageService';
import { IVideoService } from '@application/port/IVideoService';
import { logger } from '@config/logger';
import path from 'path';
import fs from 'fs';
import { readdir, rm } from 'fs/promises';
import { Prediction } from '@domain/Prediction';
import { ENV } from '@config/env';
import { IModeratePostMedia } from '@application/port/usecases/IModeratePostMedia';

export class ModeratePostMedia<ClassNames extends string>
   implements IModeratePostMedia<ClassNames>
{
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
           moderdationData:
              | { type: 'singleFrame'; result: Prediction<ClassNames>[] }
              | {
                   type: 'multiFrame';
                   result: {
                      hottestFrame: Prediction<ClassNames>[] | null;
                      hotFrames: Prediction<ClassNames>[][];
                      totalFrames: number;
                   };
                };
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

         if (dto.attachmentType.toLowerCase().startsWith('image')) {
            const result = await this._nsfwImageClassifierService.classify({
               absImagePath: download.fullFilePath,
            });

            if (dto.cleanup) {
               await this.cleanup(tempResourceName);
            }

            if (!result) {
               logger.debug(`${ModeratePostMedia.name}: no moderation result, skipping`);
               return { success: false };
            }

            return {
               success: true,
               flagged: this.isImageFlagged(result, dto.hotClassNames),
               moderdationData: { type: 'singleFrame', result },
               tempResourceName: !dto.cleanup ? tempResourceName : undefined,
            };
         } else if (dto.attachmentType.toLowerCase().startsWith('video')) {
            const result = await this.handleVideoFrameClassification({
               tempResourceName,
               absFilePath: download.fullFilePath,
               hotClassNames: dto.hotClassNames,
            });

            if (dto.cleanup) {
               await this.cleanup(tempResourceName);
            }

            if (!result) {
               logger.debug(`${ModeratePostMedia.name}: no moderation result, skipping`);
               return { success: false };
            }

            if (!result.hottestFrame) {
               return {
                  success: true,
                  moderdationData: { type: 'multiFrame', result },
                  flagged: false,
               };
            }

            const flagged = await this.isVideoFlagged(result);

            return {
               success: true,
               flagged,
               moderdationData: { type: 'multiFrame', result },
               tempResourceName: !dto.cleanup ? tempResourceName : undefined,
            };
         } else {
            logger.warn(`${ModeratePostMedia.name}: un-supported media`);
            return { success: false };
         }
      } catch (err) {
         await this.cleanup(tempResourceName);
         throw err;
      }
   };

   handleVideoFrameClassification = async (dto: {
      tempResourceName: string;
      absFilePath: string;
      hotClassNames: ClassNames[];
   }): Promise<{
      hottestFrame: Prediction<ClassNames>[] | null;
      hotFrames: Prediction<ClassNames>[][];
      totalFrames: number;
   } | null> => {
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

      const flagThreshold = parseFloat(ENV.MEDIA_CONTENT_FLAG_THRESHOLD as string);
      let largestHotClassPropability = 0;
      let hotestFrameIdx = -1;
      let hotFrames: Prediction<ClassNames>[][] = [];

      frameClassificationResult.forEach((res, idx) => {
         if (!res) return;
         let resultAddedToHotFrameFlag = false;
         res.forEach((prediction) => {
            if (!dto.hotClassNames.includes(prediction.className)) return;

            if (prediction.probability < flagThreshold) return;

            if (!resultAddedToHotFrameFlag) {
               hotFrames.push(res);
               resultAddedToHotFrameFlag = true; // prevent adding frame duplicate result
            }

            if (prediction.probability > largestHotClassPropability) {
               largestHotClassPropability = prediction.probability;
               hotestFrameIdx = idx;
            }
         });
      });

      return {
         hottestFrame: hotestFrameIdx > 0 ? frameClassificationResult[hotestFrameIdx] : null,
         hotFrames,
         totalFrames: frameFiles.length,
      };
   };

   isImageFlagged = (predictions: Prediction<ClassNames>[], hotFields: ClassNames[]): boolean => {
      const flagThreshold = parseFloat(ENV.MEDIA_CONTENT_FLAG_THRESHOLD as string);

      for (const prediction of predictions) {
         if (hotFields.includes(prediction.className) && prediction.probability > flagThreshold) {
            return true;
         }
      }

      return false;
   };

   isVideoFlagged = async (dto: {
      hotFrames: Prediction<ClassNames>[][];
      totalFrames: number;
   }): Promise<boolean> => {
      if (!dto.totalFrames) return false;

      const hottestFrameCount = dto.hotFrames.length;
      const hotVideoProbability = dto.totalFrames / hottestFrameCount;

      // flagging strategy - percentatge is for videos less than 10s
      if (hottestFrameCount > 10 || hotVideoProbability > 0.2) return true;
      else return false;
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
