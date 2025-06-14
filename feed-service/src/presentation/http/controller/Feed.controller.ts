import { ENV } from '@config/env';
import { GetFeedInputDTO, getFeedInputSchema } from '@dtos/getFeed.dto';
import { FeedServices } from '@services/feed.services';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import {
   HttpStatusCodes,
   ModerationStatus,
   PostVisibility,
   UnAuthenticatedError,
   ZodValidationError,
} from 'humane-common';
export class FeedController {
   constructor(private readonly _timelineServies: FeedServices) {}

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

         type GetPostDetailsResponse = {
            message: string;
            data: {
               posts: ({
                  author:
                     | {
                          id: string;
                          firstName: string;
                          lastName?: string | null;
                          avatarURL?: string;
                       }
                     | undefined;
                  id: string;
                  createdAt: Date;
                  updatedAt: Date;
                  authorId: string;
                  content: string;
                  visibility: (typeof PostVisibility)[keyof typeof PostVisibility];
                  moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus];
                  moderationMetadata?: any;
                  posterURL: string | null;
               } | null)[];
            };
         };

         const postIds = rawFeed.post.map((post) => post.postId);

         let hydratedPosts: GetPostDetailsResponse['data']['posts'] = [];

         if (postIds && postIds.length > 0) {
            const res = await axios.get<GetPostDetailsResponse>(
               `${ENV.ELASTICSEARCH_PROXY_BASE_URL}/api/v1/query/internal/post`,
               {
                  params: { postId: postIds },
                  paramsSerializer: { indexes: null },
               }
            );
            hydratedPosts = res.data.data.posts;
         }
         // filterout null and no autor posts

         // get hot friends

         // get hot friends timeline in this timeframe - this should be a read tough cache, with pre hydrated post details // resethc on prehydration

         // get hot users profile from read-through cache
         res.status(HttpStatusCodes.OK).json({
            message: 'timelime fetched',
            data: { posts: hydratedPosts, pagination: rawFeed.pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
