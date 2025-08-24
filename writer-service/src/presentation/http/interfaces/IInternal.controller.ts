import { Request, Response, NextFunction } from 'express';

export interface IInternalController {
   getCommentMetadataForAUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
