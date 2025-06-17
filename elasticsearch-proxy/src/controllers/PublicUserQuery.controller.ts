import {
   GetUserBasicProfileFromIdsInputDTO,
   getUserBasicProfileFromIdsSchema,
} from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { getUserProfileSchema } from 'interfaces/dto/GetUserProfile.dto';
import { infiniteScrollSearchSchema } from 'interfaces/dto/infiniteScrollSearch.dto';
import { UserServices } from '@services/User.services';
import { Request, Response, NextFunction } from 'express';
import { GenericError, ZodValidationError } from 'humane-common';
import { HttpStatusCode } from 'axios';

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

         res.status(HttpStatusCode.Ok).json({
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

         res.status(HttpStatusCode.Ok).json({
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

         res.status(HttpStatusCode.Ok).json({
            data: result,
         });
      } catch (error) {
         next(error);
      }
   };
}
