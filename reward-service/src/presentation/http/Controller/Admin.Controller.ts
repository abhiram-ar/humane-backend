import { IPlatformRewardStats } from '@ports/usecases/admin/IPlatformRewardStats.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
export class AdminController {
   constructor(private readonly _plaformRewardStats: IPlatformRewardStats) {}

   getPlatfromRewardStats = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const result = await this._plaformRewardStats.execute();

         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };
}
