import { NextFunction, Request, Response } from 'express';

export interface IAdminAuthController {
   signup(req: Request, res: Response, next: NextFunction): Promise<void>;

   login(req: Request, res: Response, next: NextFunction): Promise<void>;

   refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;

   logout(req: Request, res: Response, next: NextFunction): Promise<any>;
}
