import { Request, Response, NextFunction } from 'express';

export interface IInternalController {
   getAllFriends(req: Request, res: Response, next: NextFunction): Promise<void>;
   getRelationshipStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
