import { Request, Response, NextFunction } from 'express';

export interface IUserRelationshipController {
   sendFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
   cancelFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
   declineFriendReq(req: Request, res: Response, next: NextFunction): Promise<void>;
   removeFriendship(req: Request, res: Response, next: NextFunction): Promise<void>;
   getFriendRequestList(req: Request, res: Response, next: NextFunction): Promise<void>;
   getFriendsRequestCount(req: Request, res: Response, next: NextFunction): Promise<void>;
   getUserSendFriendRequestList(req: Request, res: Response, next: NextFunction): Promise<void>;
   acceptFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
   getFriendList(req: Request, res: Response, next: NextFunction): Promise<void>;
   getFriendsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
   getRelationshipStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
   getMutualFriendsList(req: Request, res: Response, next: NextFunction): Promise<void>;
   getMutualFriendsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}
