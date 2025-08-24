import { Request, Response, NextFunction } from 'express';
export interface IAdminController {
   getPostStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
