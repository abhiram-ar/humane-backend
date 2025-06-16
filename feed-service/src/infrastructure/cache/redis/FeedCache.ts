import { logger } from '@config/logger';
import { GetFeedInputDTO } from '@dtos/getFeed.dto';
import { FeedServices } from '@services/feed.services';
import { RedisClientType } from 'redis';
import { parseUnifiedCursor } from 'shared/UnifiedPagination.util';

export class FeedCache {
   constructor(
      public readonly _client: RedisClientType,
      private readonly _feedServices: FeedServices
   ) {}

   getUserFeed = async (dto: GetFeedInputDTO): Promise<{ value: string; score: number }[]> => {
      const max = dto.from ? parseUnifiedCursor(dto.from).createdAt.getTime() : Date.now();

      // TODO: read rawTimeline from cache
      const cacheReads = await this._client.zRangeWithScores(
         dto.userId,
         '(' + max, // exclude the current max cursor
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
         limit: 7,
      });
      const entry = recentPost.post.map((post) => ({
         score: post.createdAt.getTime(),
         value: post.postId,
      }));

      this._client.zAdd(dto.userId, entry);
      logger.info(`polpulated recent post to ${dto.userId} timeline cache`);
   };
}
