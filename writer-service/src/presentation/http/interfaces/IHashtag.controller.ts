import { Request, Response, NextFunction } from 'express';
export interface IHashtagController {
   prefixSearch(req: Request, res: Response, next: NextFunction): Promise<void>;
}
