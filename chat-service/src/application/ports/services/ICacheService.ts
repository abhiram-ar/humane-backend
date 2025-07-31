export interface ICacheService {
   set(key: string, value: string, options: { expiryInMS?: number }): Promise<{ ack: boolean }>;
   get(key: string): Promise<string | null>;
}
