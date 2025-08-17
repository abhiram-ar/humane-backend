import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { logger } from '@config/logger';
export class FFMPEGVideoService {
   constructor() {}

   extractFrames = async (dto: {
      videoPath: string;
      outputDir: string;
      fps: number;
   }): Promise<{ ok: true; error?: never } | { ok: false; error: unknown }> => {
      const fps = dto.fps > 0 ? dto.fps : 1;

      if (!fs.existsSync(dto.outputDir)) {
         await mkdir(dto.outputDir, { recursive: true });
      }

      return new Promise((res, rej) => {
         // %d: represent a decimal integer which will be the frame number
         // 06: pad the number with leading zeros to ensure a minimum of six digits, overflow is handled gracefully
         ffmpeg(dto.videoPath)
            .output(path.join(dto.outputDir, 'frame-%06d.jpg')) //
            .outputOptions(['-threads 1', `-vf fps=${fps}`])
            .on('start', (cmd) => logger.debug('FFmpeg started: ' + cmd))
            .on('end', () => {
               logger.info('FFMPEG extraction completed');
               res({ ok: true });
            })
            .on('error', (err) => {
               console.log(err);
               rej({ ok: false, error: err });
            })
            .run();
      });
   };
}
