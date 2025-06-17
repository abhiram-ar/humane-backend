import { AdminGetUserResponseDTO } from '@dtos/admin/getUsers.dto';
import { UpdateUserBlockStatusDTO } from '@dtos/admin/updateUserBlockStatus.dto';

export interface IAdminUpdateUserBlockStatus {
   execute(dto: UpdateUserBlockStatusDTO): Promise<AdminGetUserResponseDTO | null>;
}
