import { AdminUpdateUserBlockStatus } from '@application/useCases/admin/BlockUser.usecase';
import { AdminGetUserList } from '@application/useCases/admin/GetUserList.usecase';
import { updateuserblockStatusSchema } from '@dtos/admin/updateUserBlockStatus.dto';
import { GetUserDTO, getUsersForAdminSchema } from '@dtos/admin/getUsers.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { Request, Response, NextFunction } from 'express';

export class AdminUserManagementController {
   constructor(
      private readonly _getUserList: AdminGetUserList,
      private readonly _updateUserBlockStatus: AdminUpdateUserBlockStatus
   ) {}

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

         const { users, pagination } = await this._getUserList.execute(parsed.data);

         res.status(200).json({
            success: true,
            message: 'user list successfully fetched',
            data: { users, pagination, filter: { search } },
         });
      } catch (error) {
         next(error);
      }
   };

   updateBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = updateuserblockStatusSchema.safeParse(req.body);

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const updatedUser = await this._updateUserBlockStatus.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: 'User block status updated',
            data: { user: updatedUser },
         });
      } catch (error) {
         next(error);
      }
   };
}
