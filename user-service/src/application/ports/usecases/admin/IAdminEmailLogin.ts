import { adminLoginDTO } from "@dtos/admin/adminLogin.dto";


export interface IAdminEmailLogin {
   execute(dto: adminLoginDTO): Promise<{ accessToken: string; refreshToken: string }>;
}