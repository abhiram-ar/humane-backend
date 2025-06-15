import { signupAdminDTO } from '@dtos/admin/signupAdmin.dto';

export interface ICreateAdmin {
   execute(dto: signupAdminDTO): Promise<{ firstName: string; lastName?: string; email: string }>;
}
