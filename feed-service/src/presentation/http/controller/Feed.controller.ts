import { HydratedPost } from '@application/Types/HydratedPost';
import { logger } from '@config/logger';
import { GetFeedInputDTO, getFeedInputSchema } from '@dtos/getFeed.dto';
import { IESproxyService } from '@ports/IESproxyService';
import { IFeedCache } from '@ports/IFeedCache';
import { IFeedServices } from '@ports/IFeedServices';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodes, UnAuthenticatedError, ZodValidationError } from 'humane-common';
import { stringifyUnifiedCursor } from 'shared/UnifiedPagination.util';
export class FeedController {
   constructor(
      private readonly _feedServices: IFeedServices,
      private readonly _esProxyService: IESproxyService,
      private readonly _feedCache: IFeedCache
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

         const { data: queryData, success, error } = getFeedInputSchema.safeParse(dto);
         if (!success) {
            throw new ZodValidationError(error);
         }

         let postIds: string[] = [];
         let pagination: { from: string | null; hasMore: boolean } = { hasMore: false, from: null };

         const cacheReads = await this._feedCache.getUserFeed(queryData);

         if (cacheReads.length === queryData.limit) {
            postIds = cacheReads.map((cache) => cache.value);
            const lastCacheRead = cacheReads[cacheReads.length - 1];
            pagination = {
               from: stringifyUnifiedCursor(lastCacheRead.score, lastCacheRead.value),
               hasMore: true,
            };
            logger.info('full cache read');
         } else if (cacheReads.length !== 0 && cacheReads.length < queryData.limit) {
            const remainingToRead = queryData.limit - cacheReads.length;
            const lastCacheRead = cacheReads[cacheReads.length - 1];

            const newFrom = lastCacheRead
               ? stringifyUnifiedCursor(lastCacheRead.score, lastCacheRead.value)
               : queryData.from;

            const dbReads = await this._feedServices.getUserFeedPaginated({
               userId: queryData.userId,
               from: newFrom,
               limit: remainingToRead,
            });

            postIds = [
               ...cacheReads.map((cache) => cache.value),
               ...dbReads.post.map((post) => post.postId),
            ];
            pagination = dbReads.pagination;
            logger.info('partial cache read');
         } else {
            // on cache miss readFromDB or generall fallback
            const rawFeed = await this._feedServices.getUserFeedPaginated(queryData);
            postIds = rawFeed.post.map((post) => post.postId);
            pagination = rawFeed.pagination;
            logger.warn('cache miss, full DB read');
         }

         // populaate cache is it does not exsit only
         if (cacheReads.length === 0 && !queryData.from) {
            this._feedCache.addPostToUserFeed(queryData);
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
