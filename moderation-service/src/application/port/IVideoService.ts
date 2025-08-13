export interface IVideoService {
   extractFrames(dto: {
      videoPath: string;
      outputDir: string;
      fps: number;
   }): Promise<{ ok: true; error?: never } | { ok: false; error: unknown }>;
}
