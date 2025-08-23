import { Request, Response, NextFunction } from 'express';

export interface IUserNotificationController {
   getRecentNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
   markAsReadFrom(req: Request, res: Response, next: NextFunction): Promise<void>;
}
