import { Request, Response, NextFunction } from 'express';
export interface ICommentController {
   createComment(req: Request, res: Response, next: NextFunction): Promise<void>;
   deleteComment(req: Request, res: Response, next: NextFunction): Promise<void>;
}
