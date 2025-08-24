import { Request, Response, NextFunction } from 'express';
export interface IAdminController {
   getPlatfromRewardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
