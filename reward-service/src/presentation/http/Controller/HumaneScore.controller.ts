import { getUserScoreInputSchema } from '@application/dto/GetUserScore.dto';
import { IHumaneScoreServices } from '@ports/usecases/humaneScore/IHumaneScoreServices.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
import { IHumaneScoreController } from '../interfaces/IHumaneScore.controller';

export class HumaneScoreController implements IHumaneScoreController {
   constructor(private _humneScoreServices: IHumaneScoreServices) {}

   getUserScore = async (req: Request, res: Response, next: NextFunction) => {
      try {
         let userId: string | undefined;
         if (req.user && req.user.type === 'user') {
            userId = req.user.userId;
         }

         if (req.query.userId) {
            userId = req.query.userId as string;
         }

         const validatedUserId = getUserScoreInputSchema.safeParse({ userId });
         if (!validatedUserId.success) {
            throw new ZodValidationError(validatedUserId.error);
         }

         const score = await this._humneScoreServices.getUserScore(validatedUserId.data);
         res.status(HttpStatusCode.Ok).json({ data: score });
      } catch (error) {
         next(error);
      }
   };
}
