import { Request, Response, NextFunction } from 'express';
import { FriendRequest } from '@application/useCases/friendship/FriendRequest.usecase';
import {
   SendFriendRequestInputDTO,
   sendFriendRequestInputSchema,
} from '@dtos/friendship/SendFriendRequestInput.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { GetFriendRequestList } from '@application/useCases/friendship/GetFriendRequestList.usercase';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import {
   getFriendRequestInputSchema,
   GetFriendRequestListInputDTO,
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
import { GetFriends } from '@application/useCases/friendship/GetFriends.usercase';
import {
   cancelFriendRequestInputDTO,
   cancelFriendRequestInputSchema,
} from '@dtos/friendship/cancelFriendRequestInput.dto';
import { GetRelationShipStatus } from '@application/useCases/friendship/GetRelationshipStatus';
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
import { MutualFriends } from '@application/useCases/friendship/MutualFriends.usecase';
import { RemoveFriendship } from '@application/useCases/friendship/RemoveFriendship.usecase';
import {
   RemoveFriendshipInputDTO,
   removeFriendshipInputSchema,
} from '@dtos/friendship/RemoveFriendshipInput.dto';

export class UserRelationshipController {
   constructor(
      private readonly _friendRequest: FriendRequest,
      private readonly _getFriendRequestList: GetFriendRequestList,
      private readonly _getFriends: GetFriends,
      private readonly _getRelationshipStatus: GetRelationShipStatus,
      private readonly _mutualFriends: MutualFriends,
      private readonly _removeFriendship: RemoveFriendship
   ) {}

   sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
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

         res.status(200).json({ success: true, message: 'Friend request send', data: result });
      } catch (error) {
         next(error);
      }
   };

   cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
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

         res.status(201).json({
            success: true,
            message: 'friend request cancelled successfully',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   removeFriendship = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
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

         res.status(201).json({
            success: true,
            messasge: 'friendship removed successfully',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getFriendRequestList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
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

         const result = await this._getFriendRequestList.execute(parsed.data);

         res.status(200).json({
            sucess: true,
            message: 'Friend request list fetcehed successful',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
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

         res.status(201).json({ success: true, message: 'friend req accepted', data: result });
      } catch (error) {
         next(error);
      }
   };

   getFriendList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
         }
         const { size = 10, createdAt, lastId } = req.query;

         const dto: GetFriendListInputDTO = {
            userId: req.user.userId,
            from:
               createdAt && lastId
                  ? { createdAt: createdAt as string, lastId: lastId as string }
                  : null,
            size: parseInt(size as string),
         };

         const parsed = getFriendsListInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const result = await this._getFriends.list(parsed.data);

         res.status(200).json({ success: true, message: 'friend list fetched', data: result });
      } catch (error) {
         next(error);
      }
   };

   getFriendsCount = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('No userId in auth header');
         }

         const dto: GetFriendCountInputDTO = {
            userId: req.user.userId,
         };

         const parsed = getFriendsCountInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const count = await this._getFriends.count(parsed.data);

         res.status(200).json({ success: true, message: 'friend list fetched', data: { count } });
      } catch (error) {
         next(error);
      }
   };

   getRelationshipStatus = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('User not found in request header');
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

         res.status(200).json({
            success: true,
            message: 'Relationship status fetched',
            data: { status },
         });
      } catch (error) {
         next(error);
      }
   };

   getMutualFriendsList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('User not found in request header');
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

         res.status(200).json({
            success: true,
            message: 'Mutual friends list fetched',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getMutualFriendsCount = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user' || !req.user.userId) {
            throw new UnAuthenticatedError('User not found in request header');
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

         res.status(200).json({
            success: true,
            message: 'Mutual friends count fetched',
            data: { count },
         });
      } catch (error) {
         next(error);
      }
   };
}
