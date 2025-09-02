import { IPagination } from '@application/types/Pagination.type';
import { AdminGetUserResponseDTO, GetUserDTO } from '@application/DTO-mapper/admin/getUsers.dto';
import { IUserQueryService } from '@ports/IUserQueryService';
import { IUserRepository } from '@ports/IUserRepository';
import { IAdminGetUserList } from '@ports/usecases/admin/IGetUserList.usecase';

export class AdminGetUserList implements IAdminGetUserList {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _userQueryService: IUserQueryService
   ) {}

   execute = async (
      dto: GetUserDTO
   ): Promise<{
      users: AdminGetUserResponseDTO[];
      pagination: IPagination;
   }> => {
      let retivedUser: AdminGetUserResponseDTO[];
      let pagination: IPagination;

      if (dto.searchQuery) {
         const res = await this._userQueryService.searchUser(dto);

         const userIDs = res.data.users.map((user) => user.id);
         retivedUser = await this._userRepository.getUserListByIds(userIDs);
         pagination = res.data.pagination;
      } else {
         const skip = (dto.page - 1) * dto.limit;
         const result = await this._userRepository.getUserList({ ...dto, skip });
         retivedUser = result.users;

         const totalPages = Math.ceil(result.totalEntries / dto.limit) || 1;
         pagination = {
            page: dto.page,
            limit: dto.limit,
            totalItems: result.totalEntries,
            totalPages,
         };
      }

      return { users: retivedUser, pagination };
   };
}
