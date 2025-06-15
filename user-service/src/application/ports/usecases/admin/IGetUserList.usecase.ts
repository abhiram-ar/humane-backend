import { IPagination } from '@application/types/Pagination.type';
import { AdminGetUserResponseDTO, GetUserDTO } from '@dtos/admin/getUsers.dto';

export interface IAdminGetUserList {
   execute(dto: GetUserDTO): Promise<{
      users: AdminGetUserResponseDTO[];
      pagination: IPagination;
   }>;
}
