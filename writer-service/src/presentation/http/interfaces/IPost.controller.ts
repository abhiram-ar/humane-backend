import { Request, Response, NextFunction } from 'express';

export interface IPostController {
   createPost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
   deletePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
   getPresingedPosterURL: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
