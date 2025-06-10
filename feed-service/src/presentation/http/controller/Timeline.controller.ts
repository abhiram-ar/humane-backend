import { GetTimelineInputDTO, getTimelineInputSchema } from '@dtos/getTimeline.dto';
import { TimelineServices } from '@services/Timeline.services';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { UnAuthenticatedError, ZodValidationError } from 'humane-common';
export class TimelineController {
   constructor(private readonly _timelineServies: TimelineServices) {}

   getTimeline = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.user || req.user.type !== 'user') {
            throw new UnAuthenticatedError('user not found in request');
         }

         const dto: GetTimelineInputDTO = {
            userId: req.query.userId as string,
            from: (req.query.from as string) || null,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         };

         const validatedInputDTO = getTimelineInputSchema.safeParse(dto);
         if (!validatedInputDTO.success) {
            throw new ZodValidationError(validatedInputDTO.error);
         }

         const rawTimeline = await this._timelineServies.getUserTimelinePaginated(
            validatedInputDTO.data
         );

         res.status(HttpStatusCode.Ok).json({ message: 'timelime fetched', data: rawTimeline });
      } catch (error) {
         next(error);
      }
   };
}
