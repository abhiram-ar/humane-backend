export interface IStorageService {
   generatePreSignedURL(
      userId: string,
      key: string,
      mimeType: string
   ): Promise<{ preSignedURL: string; key: string } | null>;
   getPublicCDNURL(key: string): string;
}
