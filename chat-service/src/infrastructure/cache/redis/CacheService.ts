import { ICacheService } from '@ports/services/ICacheService';
import { redisClient } from './client';
import { AppConstants } from '@config/constants';
import { logger } from '@config/logger';

export class RedisCacheService implements ICacheService {
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
