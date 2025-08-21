import { GenericError } from '@application/errors/GenericError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { IsHotUser } from '@application/useCases/user/isHotUser.usecase';
import {
   GetRelationShipStatusInputDTO,
   getRelationshipStatusSchema,
} from '@dtos/friendship/GetRelationshipStatus.dto';
import { IGetFriends } from '@ports/usecases/friendship/IGetFriends.usercase';
import { IGetRelationShipStatus } from '@ports/usecases/friendship/IGetRelationshipStatus';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

export class InternalController {
   constructor(
      private readonly _isHotUser: IsHotUser,
      private readonly _getFriends: IGetFriends,
      private readonly _getRelationshipStatus: IGetRelationShipStatus
   ) {}

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
            data: { isHotUser: false, friends },
         });
      } catch (error) {
         next(error);
      }
   };

   getRelationshipStatus = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { targetUserId, currentUserId } = req.query;

         const dto: GetRelationShipStatusInputDTO = {
            currentUserId: currentUserId as string,
            targetUserId: targetUserId as string,
         };
         const parsed = getRelationshipStatusSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const status = await this._getRelationshipStatus.execute(parsed.data);

         res.status(200).json({
            success: true,
            message: 'Relationship status fetched',
            data: { status },
         });
      } catch (error) {
         next(error);
      }
   };
}
