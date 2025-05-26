import { getUserProfileSchema } from '@dtos/GetUserProfile.dto';
import { infiniteScrollSearchSchema } from '@dtos/infiniteScrollSearch.dto';
import { UserServices } from '@services/User.services';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
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
}
