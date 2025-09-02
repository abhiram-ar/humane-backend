import { IPagination } from '@application/types/Pagination.type';
import { AdminGetUserResponseDTO, GetUserDTO } from '@application/DTO-mapper/admin/getUsers.dto';

export interface IAdminGetUserList {
   execute(dto: GetUserDTO): Promise<{
      users: AdminGetUserResponseDTO[];
      pagination: IPagination;
   }>;
}
