import { HydratedPost } from '@application/Types/HydratedPost';
import { logger } from '@config/logger';
import { GetFeedInputDTO, getFeedInputSchema } from '@dtos/getFeed.dto';
import { redisClient } from '@infrastructure/cache/redis/client';
import { FeedCache } from '@infrastructure/cache/redis/FeedCache';
import { IESproxyService } from '@ports/IESproxyService';
import { FeedServices } from '@services/feed.services';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodes, UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class FeedController {
   constructor(
      private readonly _feedServices: FeedServices,
      private readonly _esProxyService: IESproxyService,
      private readonly _feedCache: FeedCache
   ) {}

   getTimeline = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not found in request');
         }

         const dto: GetFeedInputDTO = {
            userId: req.user.userId,
            from: (req.query.from as string) || null,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         };

         const validatedInputDTO = getFeedInputSchema.safeParse(dto);
         if (!validatedInputDTO.success) {
            throw new ZodValidationError(validatedInputDTO.error);
         }

         let postIds: string[] = [];
         let pagination: { from: string | null; hasMore: boolean } = { hasMore: false, from: null };

         const max = validatedInputDTO.data.from
            ? new Date(parseInt(validatedInputDTO.data.from.split('|')[0])).getTime()
            : Date.now();

         // TODO: read rawTimeline from cache
         const cacheReads = await redisClient.zRangeWithScores(
            validatedInputDTO.data.userId,
            '(' + max, // exclude the current max cursor
            0, // min
            {
               BY: 'SCORE',
               REV: true,
               LIMIT: { offset: 0, count: validatedInputDTO.data.limit },
            }
         );
         if (cacheReads.length === validatedInputDTO.data.limit) {
            postIds = cacheReads.map((cache) => cache.value);
            const lastCacheRead = cacheReads[cacheReads.length - 1];
            pagination = { from: `${lastCacheRead.score}|${lastCacheRead.value}`, hasMore: true };
            logger.info('full cache read');
         } else if (cacheReads.length !== 0 && cacheReads.length < validatedInputDTO.data.limit) {
            const remainingToRead = validatedInputDTO.data.limit - cacheReads.length;
            const lastCacheRead = cacheReads[cacheReads.length - 1];

            const newFrom = lastCacheRead
               ? [lastCacheRead.score, lastCacheRead.value].join('|')
               : validatedInputDTO.data.from;

            const dbReads = await this._feedServices.getUserFeedPaginated({
               userId: validatedInputDTO.data.userId,
               from: newFrom,
               limit: remainingToRead,
            });

            console.log(
               'DBread',
               dbReads.post.map((post) => post.postId)
            );

            postIds = [
               ...cacheReads.map((cache) => cache.value),
               ...dbReads.post.map((post) => post.postId),
            ];
            pagination = dbReads.pagination;
            logger.info('partial cache read');
         } else {
            // on cache miss readFromDB or generall fallback
            const rawFeed = await this._feedServices.getUserFeedPaginated(validatedInputDTO.data);
            postIds = rawFeed.post.map((post) => post.postId);
            pagination = rawFeed.pagination;
            logger.warn('cache miss, full DB read');
         }

         // TODO: populaate cache is it does not exsit only
         if (cacheReads.length === 0 && !validatedInputDTO.data.from) {
            const recentPost = await this._feedServices.getUserFeedPaginated({
               ...validatedInputDTO.data,
               limit: 7,
            });
            const entry = recentPost.post.map((post) => ({
               score: post.createdAt.getTime(),
               value: post.postId,
            }));
            redisClient.zAdd(validatedInputDTO.data.userId, entry);
            logger.info('added to cache');
         }

         // hydrate rawFeed with users and post details
         let hydratedPosts: (HydratedPost | null)[] = [];
         if (postIds && postIds.length > 0) {
            hydratedPosts = await this._esProxyService.getPostsDetail(postIds);
         }
         // filterout null and no autor posts

         // get hot friends

         // get hot friends timeline in this timeframe - this should be a read tough cache, with pre hydrated post details // resethc on prehydration

         // get hot users profile from read-through cache
         res.status(HttpStatusCodes.OK).json({
            data: { posts: hydratedPosts, pagination: pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
