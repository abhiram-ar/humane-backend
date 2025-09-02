import { signupAdminDTO } from '@application/DTO-mapper/admin/signupAdmin.dto';

export interface ICreateAdmin {
   execute(dto: signupAdminDTO): Promise<{ firstName: string; lastName?: string; email: string }>;
}
