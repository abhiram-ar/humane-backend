import {
   GetUserBasicProfileFromIdsInputDTO,
   getUserBasicProfileFromIdsSchema,
} from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { getUserProfileSchema } from 'interfaces/dto/GetUserProfile.dto';
import { infiniteScrollSearchSchema } from 'interfaces/dto/infiniteScrollSearch.dto';
import { UserServices } from '@services/User.services';
import { Request, Response, NextFunction } from 'express';
import {
   AuthorizationError,
   GenericError,
   PostVisibility,
   ZodValidationError,
} from 'humane-common';
import {
   GetUserTimelineInputDTO,
   getUserTimelineSchema,
} from 'interfaces/dto/post/GetUserTimeline.dto';
import axios from 'axios';
import { ENV } from '@config/env';
export class PublicUserQueryController {
   constructor(private readonly _userSerives: UserServices) {}

   getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { userId } = req.params;

         const parsed = getUserProfileSchema.safeParse(userId);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const user = await this._userSerives.getUserProfile(parsed.data);

         res.status(200).json({
            success: true,
            message: 'user successfully fetched',
            data: { user },
         });
      } catch (error) {
         next(error);
      }
   };

   getUserBasicDetailsFromIds = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { userId } = req.query;

         let ids: GetUserBasicProfileFromIdsInputDTO;
         if (typeof userId === 'string') {
            ids = [userId];
         } else if (Array.isArray(userId)) {
            ids = userId as string[];
         } else {
            throw new GenericError('Invalid userId type for this query');
         }

         const parsed = getUserBasicProfileFromIdsSchema.safeParse(ids);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const user = await this._userSerives.getBasicUserProfile(parsed.data);

         res.status(200).json({
            success: true,
            message: 'user list successfully fetched',
            data: { user },
         });
      } catch (error) {
         console.log(error);
         next(error);
      }
   };

   searchUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { searchQuery, searchAfter, limit = 10 } = req.query;

         const dto = {
            searchQuery,
            searchAfter: searchAfter ? [parseInt(searchAfter as string)] : null,
            limit: parseInt(limit as string),
         };

         const parsed = infiniteScrollSearchSchema.safeParse(dto);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const result = await this._userSerives.infiniteScollSearch(parsed.data);

         res.status(200).json({
            success: true,
            message: 'userlist successfully fetched',
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };

   getUserTimeline = async(req: Request, res: Response, next: NextFunction) => {
      try {
         let filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined;

         const dto: GetUserTimelineInputDTO = {
            targetUserId: req.params.targetUserId,
            limit: parseInt((req.query.limit as string) || '10'),
            from: req.query.from as string,
         };
         const validatedDTO = getUserTimelineSchema.safeParse(dto);
         if (!validatedDTO.success) {
            throw new ZodValidationError(validatedDTO.error);
         }

         if (!req.user || req.user.type !== 'user') {
            filter = 'public'; // if no user get only the public posts of targetUser
         } else {
            type RelationshipStatus =
               | 'sameUser'
               | 'strangers'
               | 'friends'
               | 'friendreqSend'
               | 'friendReqWaitingApproval'
               | 'blocked';

            type RelationshipStatusResponse = {
               success: boolean;
               message: string;
               data: { status: RelationshipStatus };
            };
            // const res = await axios.get<RelationshipStatusResponse>();
         }
      } catch (error) {
         next(error);
      }
   };
}
