import { Request, Response, NextFunction } from 'express';

export interface IAdminUserManagementController {
   getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
   updateBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
   getUserstats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
