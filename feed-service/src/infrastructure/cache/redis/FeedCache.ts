import { logger } from '@config/logger';
import { GetFeedInputDTO } from '@dtos/getFeed.dto';
import { FeedServices } from '@services/Feed.services';
import { parseUnifiedCursor } from 'shared/UnifiedPagination.util';
import { redisClient } from './client';
import { IFeedCache } from '@ports/IFeedCache';
import { ENV } from '@config/env';

export class FeedCache implements IFeedCache {
   constructor(private readonly _feedServices: FeedServices) {}

   getUserFeed = async (dto: GetFeedInputDTO): Promise<{ value: string; score: number }[]> => {
      const max = dto.from ? parseUnifiedCursor(dto.from).createdAt.getTime() : Date.now();

      const cacheReads = await redisClient.zRangeWithScores(
         dto.userId,
         '(' + max, // ( -> exclude the current max cursor
         0, // min
         {
            BY: 'SCORE',
            REV: true,
            LIMIT: { offset: 0, count: dto.limit },
         }
      );

      return cacheReads;
   };

   addPostToUserFeed = async (dto: GetFeedInputDTO) => {
      const recentPost = await this._feedServices.getUserFeedPaginated({
         ...dto,
         limit: parseInt(ENV.FEED_CACHE_SIZE as string),
      });
      const entry = recentPost.post.map((post) => ({
         score: post.createdAt.getTime(),
         value: post.postId,
      }));

      if (entry.length > 0) {
         await redisClient.zAdd(dto.userId, entry);
         logger.debug(`polpulated recent post to ${dto.userId} timeline cache`);
      } else {
         logger.warn('skipping recent post cache polpulation as there is no post to add');
      }
   };
}
