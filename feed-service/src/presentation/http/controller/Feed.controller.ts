import { HydratedPost } from '@application/Types/HydratedPost';
import { GetFeedInputDTO, getFeedInputSchema } from '@dtos/getFeed.dto';
import { IESproxyService } from '@ports/IESproxyService';
import { FeedServices } from '@services/feed.services';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCodes, UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class FeedController {
   constructor(
      private readonly _timelineServies: FeedServices,
      private readonly _esProxyService: IESproxyService
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
         // TODO: read rawTimeline from cache

         // on miss read from DB
         const rawFeed = await this._timelineServies.getUserFeedPaginated(validatedInputDTO.data);
         // TODO: populaate cache is it does not exsit only

         // hydrate rawFeed with users and post details

         const postIds = rawFeed.post.map((post) => post.postId);

         let hydratedPosts: (HydratedPost | null)[] = [];

         if (postIds && postIds.length > 0) {
            hydratedPosts = await this._esProxyService.getPostsDetail(postIds);
         }
         // filterout null and no autor posts

         // get hot friends

         // get hot friends timeline in this timeframe - this should be a read tough cache, with pre hydrated post details // resethc on prehydration

         // get hot users profile from read-through cache
         res.status(HttpStatusCodes.OK).json({
            data: { posts: hydratedPosts, pagination: rawFeed.pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
