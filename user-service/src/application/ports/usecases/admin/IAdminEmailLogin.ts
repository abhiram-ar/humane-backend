import { adminLoginDTO } from "@dtos/admin/adminLogin.dto";


export interface AdminEmailLogin {
   execute(dto: adminLoginDTO): Promise<{ accessToken: string; refreshToken: string }>;
}