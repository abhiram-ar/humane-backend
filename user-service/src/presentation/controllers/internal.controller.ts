import { GenericError } from '@application/errors/GenericError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GetFriends } from '@application/useCases/friendship/GetFriends.usercase';
import { IsHotUser } from '@application/useCases/user/isHotUser.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

export class InternalController {
   constructor(private readonly _isHotUser: IsHotUser, private readonly _getFriends: GetFriends) {}

   getAllFriends = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const userId = req.params.userId;
         if (!userId) {
            throw new GenericError('userId not present in request');
         }
         const isHotUser = await this._isHotUser.execute(userId);
         if (isHotUser === null) {
            throw new UserNotFoundError(`userId ${userId} does not exist`);
         }
         if (isHotUser) {
            res.status(HttpStatusCode.Ok).json({
               message: 'user is hot user not sending full friendlist',
               data: { isHotUser: true },
            });
         }

         const friends = await this._getFriends.allFriends(userId);

         res.status(HttpStatusCode.Ok).json({
            message: 'non hot user, friendslist included',
            data: { isHotUser: false, friends },
         });
      } catch (error) {
         next(error);
      }
   };
}
