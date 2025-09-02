import { adminLoginDTO } from "@application/DTO-mapper/admin/adminLogin.dto";


export interface IAdminEmailLogin {
   execute(dto: adminLoginDTO): Promise<{ accessToken: string; refreshToken: string }>;
}