import { AdminGetUserList } from '@application/useCases/admin/GetUserList.usecase';
import { GetUserDTO, getUsersForAdminSchema } from '@dtos/admin/getUsers.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { Request, Response, NextFunction } from 'express';

export class AdminUserManagementController {
   constructor(private readonly _adminGetusersList: AdminGetUserList) {}

   getUsers = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { search, page = '1', limit = '10' } = req.query;

         const dto = {
            searchQuery: search as string,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
         } as GetUserDTO;

         const parsed = getUsersForAdminSchema.safeParse(dto);
         console.log('dto', dto, parsed.data);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { users, pagination } = await this._adminGetusersList.execute(parsed.data);

         res.status(200).json({
            success: true,
            message: 'user list successfully fetched',
            data: { users, pagination, filter: { search } },
         });
      } catch (error) {
         next(error);
      }
   };
}
