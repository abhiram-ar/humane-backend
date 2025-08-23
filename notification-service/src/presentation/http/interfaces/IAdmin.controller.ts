import { Request, Response, NextFunction } from 'express';
export interface IAdminController {
   getUsersOnline(req: Request, res: Response, next: NextFunction): Promise<void>;
}
