import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { unlink } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { logger } from '@config/logger';
export class AWSStorageService {
   constructor(private readonly _s3Client: S3Client) {}

   getObject = async (dto: {
      key: string;
      bucket: string;
      tempFileName: string;
      saveDirPath: string;
   }): Promise<{ ok: false } | { ok: true; fullFilePath: string }> => {
      const command = new GetObjectCommand({ Bucket: dto.bucket, Key: dto.key });
      const res = await this._s3Client.send(command);

      if (!res.Body) return { ok: false };

      const fullFilePath = path.join(dto.saveDirPath, dto.tempFileName);
      const writeDir = path.parse(fullFilePath);

      // directory exisiting check
      if (!fs.existsSync(writeDir.dir)) {
         logger.debug('file does not exist creating one');
         fs.mkdirSync(writeDir.dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(fullFilePath);

      // convert the web Stream to a nodejs Readable
      const webReadableStream = res.Body.transformToWebStream();
      const nodeJsReadableStream = Readable.fromWeb(webReadableStream);

      try {
         await new Promise((resolve, rej) => {
            nodeJsReadableStream
               .on('error', rej)
               .pipe(writeStream)
               .on('error', rej)
               .on('finish', () => resolve(undefined));
         });

         return { ok: true, fullFilePath };
      } catch (error) {
         try {
            logger.warn('error: running file clean up' + fullFilePath);
            if (fullFilePath && fs.existsSync(fullFilePath)) {
               await unlink(fullFilePath);
            }
         } catch (error) {
            console.log('cleanup failed');
         }
         return { ok: false };
      }
   };
}
