import { IPagination } from '@application/types/Pagination.type';
import { AdminGetUserResponseDTO, GetUserDTO } from '@dtos/admin/getUsers.dto';
import { IUserRepository } from '@ports/IUserRepository';

export class AdminGetUserList {
   constructor(private readonly _userRepository: IUserRepository) {}

   execute = async (
      dto: GetUserDTO
   ): Promise<{
      users: AdminGetUserResponseDTO[];
      pagination: IPagination;
   }> => {
      const skip = (dto.page - 1) * dto.limit;

      const result = await this._userRepository.getUserList({ ...dto, skip });

      const totalPages = Math.ceil(result.totalEntries / dto.limit) || 1;

      const pagination: IPagination = {
         page: dto.page,
         limit: dto.limit,
         totalItems: result.totalEntries,
         totalPages,
      };

      return { users: result.users, pagination };
   };
}
