export interface IStorageService {
   generatePreSignedURL(key: string, mimeType: string): Promise<string | null>;
   getPublicCDNURL(key: string): string;
}
