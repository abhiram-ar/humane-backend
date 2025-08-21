import { NextFunction, Request, Response } from 'express';

export interface IUserProfileController {
   getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
   updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
   generatePreSignedURL(req: Request, res: Response, next: NextFunction): Promise<void>;
   updateAvatarPhoto(req: Request, res: Response, next: NextFunction): Promise<void>;
   updateCoverPhoto(req: Request, res: Response, next: NextFunction): Promise<void>;
}
