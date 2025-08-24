import { Request, Response, NextFunction } from 'express';
export interface ILikeController {
   addCommentLikeRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
   commnetUnlikeRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
}
