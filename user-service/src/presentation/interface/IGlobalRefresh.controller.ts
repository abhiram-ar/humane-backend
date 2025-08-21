import { Request, Response, NextFunction } from 'express';

export interface IGlobalRefreshController {
   refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
}
