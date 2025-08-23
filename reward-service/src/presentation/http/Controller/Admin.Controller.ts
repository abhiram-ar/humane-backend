import { IPlatformRewardStats } from '@ports/usecases/admin/IPlatformRewardStats.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../interfaces/IAdmin.Controller';
export class AdminController implements IAdminController {
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
