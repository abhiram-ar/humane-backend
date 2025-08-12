import { logger } from '@config/logger';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs/promises';
import { FileSystemError, fileSystemErrorMessages } from '@application/errors/FileSystemError';
export class NSFWJSImageClassifierService {
   private _model: nsfwjs.NSFWJS | undefined;
   constructor() {}

   loadModel = async (modelPath: string) => {
      // file://  required for tfjs-node local loading
      this._model = await nsfwjs.load(`file://${modelPath}`, { size: 299 });
      logger.info('model loaded');
   };

   classify = async (dto: {
      absImagePath: string;
   }): Promise<{ className: string; probability: number }[] | null> => {
      if (!this._model) {
         logger.error('model not loaded');
         return null;
      }

      let imageBuffer: Buffer<ArrayBufferLike>;
      try {
         imageBuffer = await fs.readFile(dto.absImagePath);
      } catch (error) {
         const typedError = error as any;
         if (typedError.code && typedError.code && typedError.code === 'ENOENT') {
            throw new FileSystemError(fileSystemErrorMessages.NON_EXISTING_RESOURCE);
         }
         logger.error(error);
         return null;
      }

      // supports only BMP, GIF, JPEG and PNG
      // TODO: sharp library can convert images to required format
      const imageTensor = tf.node.decodeImage(imageBuffer, 3);

      const predictions = await this._model.classify(imageTensor);

      imageTensor.dispose();

      return predictions;
   };
}
