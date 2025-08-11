export interface ICacheService {
   set(key: string, value: string, options: { expiryInMS?: number }): Promise<{ ack: boolean }>;
   get(key: string): Promise<string | null>;

   hSet(key: string, field: {}): Promise<number>;

   hGetAll(key: string): Promise<Record<string, string>>;

   setKeyExpiryInSeconds(
      key: string,
      expiryTime: number,
      mode?: 'NX' | 'GT' | 'LT'
   ): Promise<number>;

   hSetNotExistingField(key: string, field: string, value: string): Promise<1 | 0>;
}
