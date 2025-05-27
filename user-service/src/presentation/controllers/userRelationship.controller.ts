import { Request, Response, NextFunction } from 'express';
import { SendFriendRequest } from '@application/useCases/friendship/SendFriendRequest.usecase';
import { sendFriendRequestInputSchema } from '@dtos/friendship/SendFriendRequestInput.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { GetFriendRequestList } from '@application/useCases/friendship/GetFriendRequestList.usercase';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import {
   getFriendRequestInputSchema,
   GetFriendRequestListInputDTO,
} from '@dtos/friendship/GetFriendRequests.dto';
import { acceptFriendRequestSchema } from '@dtos/friendship/AcceptFriendRequset.dto';
import { AcceptFriendRequest } from '@application/useCases/friendship/AcceptFriendRequest.usercase';
import { getFriendInputSchema, GetFriendListInputDTO } from '@dtos/friendship/GetFriends.dto';
import { GetFriendList } from '@application/useCases/friendship/GetFriendList.usercase';

export class UserRelationshipController {
   constructor(
      private readonly _sendFriendRequest: SendFriendRequest,
      private readonly _getFriendRequestList: GetFriendRequestList,
      private readonly _acceptFriendReq: AcceptFriendRequest,
      private readonly _getFriendList: GetFriendList
   ) {}

   sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = sendFriendRequestInputSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._sendFriendRequest.execute(parsed.data);

         res.status(200).json({ success: true, message: 'Friend request send', data: result });
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
         const parsed = acceptFriendRequestSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }
         const result = await this._acceptFriendReq.execute(parsed.data);

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

         const parsed = getFriendInputSchema.safeParse(dto);
         if (!parsed.success) throw new ZodValidationError(parsed.error);

         const result = await this._getFriendList.execute(parsed.data);
         res.status(200).json({ success: true, message: 'friend list fetched', data: result });
      } catch (error) {
         next(error);
      }
   };
}
