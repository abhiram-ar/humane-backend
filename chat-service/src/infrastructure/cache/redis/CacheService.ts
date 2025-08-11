import { ICacheService } from '@ports/services/ICacheService';
import { redisClient } from './client';
import { AppConstants } from '@config/constants';
import { logger } from '@config/logger';

export class RedisCacheService implements ICacheService {
   hGetAll = async (key: string): Promise<Record<string, string>> => {
      return await redisClient.hGetAll(key);
   };
   hSet = async (key: string, field: {}): Promise<number> => {
      return await redisClient.hSet(key, field);
   };
   setKeyExpiryInSeconds = async (
      key: string,
      expiryTime: number,
      mode?: 'NX' | 'GT' | 'LT'
   ): Promise<number> => {
      return await redisClient.pExpire(key, expiryTime, mode);
   };
   hSetNotExistingField = async (key: string, field: string, value: string): Promise<1 | 0> => {
      return await redisClient.hSetNX(key, field, value);
   };
   set = async (
      key: string,
      value: string,
      { expiryInMS = AppConstants.TIME_24HRS }: { expiryInMS?: number }
   ): Promise<{ ack: boolean }> => {
      try {
         const res = await redisClient.set(key, value, {
            expiration: { type: 'PX', value: expiryInMS },
         });
         return { ack: res ? true : false };
      } catch (error) {
         logger.error(error);
         return { ack: false };
      }
   };
   get = async (key: string): Promise<string | null> => {
      return redisClient.get(key);
   };
}
