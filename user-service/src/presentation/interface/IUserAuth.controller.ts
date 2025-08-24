import { NextFunction, Request, Response } from 'express';

export interface IUserAuthController {
   signup(req: Request, res: Response, next: NextFunction): Promise<void>;
   verify(req: Request, res: Response, next: NextFunction): Promise<void>;
   login(req: Request, res: Response, next: NextFunction): Promise<void>;
   refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;
   logout(req: Request, res: Response, next: NextFunction): Promise<void>;
   forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
   resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
   googleAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
}
