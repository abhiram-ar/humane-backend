import { IPostsStats } from '@ports/IPostsStatService';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../interfaces/IAdmin.Controller';
export class AdminController implements IAdminController {
   constructor(private readonly _postsStat: IPostsStats) {}

   getPostStats = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const result = await this._postsStat.execute();
         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };
}
