import { paginatedSearchSchema } from 'interfaces/dto/paginatedSearch.dto';
import { UserServices } from '@services/User.services';
import { Request, Response, NextFunction } from 'express';
import { ZodValidationError } from 'humane-common';
export class InternalUserQueryController {
   constructor(private readonly _userSerives: UserServices) {}

   searchUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { searchQuery = '', page = 1, limit = 10 } = req.query;

         const dto = {
            search: searchQuery,
            limit: parseInt(limit as string),
            page: parseInt(page as string),
         };
         const parsedDTO = paginatedSearchSchema.safeParse(dto);
         if (!parsedDTO.success) {
            console.log(parsedDTO.error);
            throw new ZodValidationError(parsedDTO.error);
         }

         const { users, pagination } = await this._userSerives.paginatedSearch(parsedDTO.data);

         res.status(200).json({
            success: true,
            message: 'userlist successfully fetched',
            data: { users, pagination },
         });
      } catch (error) {
         next(error);
      }
   };
}
