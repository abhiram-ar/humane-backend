import { Request, Response, NextFunction } from 'express';
import {
   SendFriendRequestInputDTO,
   sendFriendRequestInputSchema,
} from '@dtos/friendship/SendFriendRequestInput.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import {
   GetFriendRequestCountInputDTO,
   getFriendRequestInputSchema,
   GetFriendRequestListInputDTO,
   getFriendsRequestCountInputSchema,
} from '@dtos/friendship/GetFriendRequests.dto';
import {
   acceptFriendRequestSchema,
   AcceptFriendshipInputDTO,
} from '@dtos/friendship/AcceptFriendRequset.dto';
import {
   getFriendsListInputSchema,
   GetFriendListInputDTO,
   GetFriendCountInputDTO,
   getFriendsCountInputSchema,
} from '@dtos/friendship/GetFriends.dto';
import {
   cancelFriendRequestInputDTO,
   cancelFriendRequestInputSchema,
} from '@dtos/friendship/cancelFriendRequestInput.dto';
import {
   GetRelationShipStatusInputDTO,
   getRelationshipStatusSchema,
} from '@dtos/friendship/GetRelationshipStatus.dto';
import {
   MutualFriendsCountInputDTO,
   mutualFriendsCountInputSchema,
   MutualFriendsListInputDTO,
   mutualFriendsListInputSchema,
} from '@dtos/friendship/MutualFriends.dto';
import {
   RemoveFriendshipInputDTO,
   removeFriendshipInputSchema,
} from '@dtos/friendship/RemoveFriendshipInput.dto';
import {
   getUserSendFriendRequestInputSchema,
   GetUserSendFriendRequestListInputDTO,
} from '@dtos/friendship/GetUserSendFriendRequests.dto';
import { HttpStatusCode } from 'axios';
import { IFriendRequest } from '@ports/usecases/friendship/IFriendRequest.usecase';
import { IGetFriendRequest } from '@ports/usecases/friendship/IGetFriendRequestList.usercase';
import { IGetFriends } from '@ports/usecases/friendship/IGetFriends.usercase';
import { IGetRelationShipStatus } from '@ports/usecases/friendship/IGetRelationshipStatus';
import { IMutualFriends } from '@ports/usecases/friendship/IMutualFriends.usecase';
import { IRemoveFriendship } from '@ports/usecases/friendship/IRemoveFriendship.usecase';
import { IGetUserSendFriendRequestList } from '@ports/usecases/friendship/IGetUserSendFriendRequestList.usercase';

export class UserRelationshipController {
   constructor(
      private readonly _friendRequest: IFriendRequest,
      private readonly _getFriendRequest: IGetFriendRequest,
      private readonly _getFriends: IGetFriends,
      private readonly _getRelationshipStatus: IGetRelationShipStatus,
      private readonly _mutualFriends: IMutualFriends,
      private readonly _removeFriendship: IRemoveFriendship,
      private readonly _getUserSendFriendReq: IGetUserSendFriendRequestList
   ) {}

   sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }

         const { recieverId } = req.body;

         const dto: SendFriendRequestInputDTO = {
            requesterId: req.user.userId,
            recieverId: recieverId,
         };

         const parsed = sendFriendRequestInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._friendRequest.send(parsed.data);

         res.status(HttpStatusCode.Created).json({ data: result });
      } catch (error) {
         next(error);
      }
   };

   cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }

         const { recieverId } = req.body;

         const dto: cancelFriendRequestInputDTO = {
            requesterId: req.user.userId,
            recieverId: recieverId,
         };

         const parsed = cancelFriendRequestInputSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._friendRequest.cancel(parsed.data);

         res.status(HttpStatusCode.Accepted).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   declineFriendReq = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }

         const { targetUserId } = req.params;

         const dto: RemoveFriendshipInputDTO = {
            currenUserId: req.user.userId,
            targetUserId: targetUserId,
         };

         const parsed = removeFriendshipInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._friendRequest.decline(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   removeFriendship = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }

         const { targetUserId } = req.params;

         const dto: RemoveFriendshipInputDTO = {
            currenUserId: req.user.userId,
            targetUserId: targetUserId,
         };

         const parsed = removeFriendshipInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._removeFriendship.execute(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getFriendRequestList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { size = 10, createdAt, lastId } = req.query;

         const dto: GetFriendRequestListInputDTO = {
            userId: req.user.userId,
            from:
               createdAt && lastId
                  ? { createdAt: createdAt as string, lastId: lastId as string }
                  : null,
            size: parseInt(size as string),
         };

         const parsed = getFriendRequestInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._getFriendRequest.list(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getFriendsRequestCount = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const dto: GetFriendRequestCountInputDTO = {
            userId: req.user.userId,
         };

         const parsed = getFriendsRequestCountInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const count = await this._getFriendRequest.count(parsed.data);

         res.status(HttpStatusCode.Ok).json({ data: { count } });
      } catch (error) {
         next(error);
      }
   };

   getUserSendFriendRequestList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { size = 10, createdAt, lastId } = req.query;

         const dto: GetUserSendFriendRequestListInputDTO = {
            userId: req.user.userId,
            from:
               createdAt && lastId
                  ? { createdAt: createdAt as string, lastId: lastId as string }
                  : null,
            size: parseInt(size as string),
         };

         const parsed = getUserSendFriendRequestInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._getUserSendFriendReq.execute(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }

         const { requesterId } = req.body;

         const dto: AcceptFriendshipInputDTO = {
            userId: req.user.userId,
            requesterId,
         };

         const parsed = acceptFriendRequestSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._friendRequest.accept(parsed.data);

         res.status(HttpStatusCode.Created).json({ data: result });
      } catch (error) {
         next(error);
      }
   };

   getFriendList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
         }
         const { size = 10, createdAt, lastId, targetUserId } = req.query;

         const dto: GetFriendListInputDTO = {
            userId: targetUserId as string,
            from:
               createdAt && lastId
                  ? { createdAt: createdAt as string, lastId: lastId as string }
                  : null,
            size: parseInt(size as string),
         };

         const parsed = getFriendsListInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const result = await this._getFriends.list(parsed.data);

         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };

   getFriendsCount = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { targetUserId } = req.query;
         const dto: GetFriendCountInputDTO = {
            userId: targetUserId as string,
         };

         const parsed = getFriendsCountInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const count = await this._getFriends.count(parsed.data);

         res.status(HttpStatusCode.Ok).json({ data: { count } });
      } catch (error) {
         next(error);
      }
   };

   getRelationshipStatus = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { targetUserId } = req.query;

         const dto: GetRelationShipStatusInputDTO = {
            targetUserId: targetUserId as string,
            currentUserId: req.user.userId,
         };
         const parsed = getRelationshipStatusSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const status = await this._getRelationshipStatus.execute(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: { status },
         });
      } catch (error) {
         next(error);
      }
   };

   getMutualFriendsList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { size = 10, createdAt, lastId, targetUserId } = req.query;

         const dto: MutualFriendsListInputDTO = {
            targetUserId: targetUserId as string,
            currentUserId: req.user.userId,
            from:
               createdAt && lastId
                  ? { createdAt: createdAt as string, lastId: lastId as string }
                  : null,
            size: parseInt(size as string),
         };

         const parsed = mutualFriendsListInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._mutualFriends.list(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getMutualFriendsCount = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError();
         }
         const { targetUserId } = req.query;

         const dto: MutualFriendsCountInputDTO = {
            targetUserId: targetUserId as string,
            currentUserId: req.user.userId,
         };

         const parsed = mutualFriendsCountInputSchema.safeParse(dto);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const count = await this._mutualFriends.count(parsed.data);

         res.status(HttpStatusCode.Ok).json({
            data: { count },
         });
      } catch (error) {
         next(error);
      }
   };
}
