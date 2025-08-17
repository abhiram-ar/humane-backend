export interface IStorageService {
   getObject(dto: {
      key: string;
      bucket: string;
      tempFileName: string;
      saveDirPath: string;
   }): Promise<{ ok: false } | { ok: true; fullFilePath: string }>;
}
