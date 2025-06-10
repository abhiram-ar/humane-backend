import { GetFeedInputDTO, getFeedInputSchema } from '@dtos/getFeed.dto';
import { FeedServices } from '@services/feed.services';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class FeedController {
   constructor(private readonly _timelineServies: FeedServices) {}

   getTimeline = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not found in request');
         }

         const dto: GetFeedInputDTO = {
            userId: req.query.userId as string,
            from: (req.query.from as string) || null,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         };

         const validatedInputDTO = getFeedInputSchema.safeParse(dto);
         if (!validatedInputDTO.success) {
            throw new ZodValidationError(validatedInputDTO.error);
         }

         const rawTimeline = await this._timelineServies.getUserFeedPaginated(
            validatedInputDTO.data
         );

         res.status(HttpStatusCode.Ok).json({ message: 'timelime fetched', data: rawTimeline });
      } catch (error) {
         next(error);
      }
   };
}
