import { Request, Response, NextFunction } from 'express';

export interface IHumaneScoreController {
   getUserScore(req: Request, res: Response, next: NextFunction): Promise<void>;
}
