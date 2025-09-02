import { AdminGetUserResponseDTO } from '@application/DTO-mapper/admin/getUsers.dto';
import { UpdateUserBlockStatusDTO } from '@application/DTO-mapper/admin/updateUserBlockStatus.dto';

export interface IAdminUpdateUserBlockStatus {
   execute(dto: UpdateUserBlockStatusDTO): Promise<AdminGetUserResponseDTO | null>;
}
