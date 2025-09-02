import { verifyUserDTO } from '@application/DTO-mapper/user/verifyUser.dto';

export interface IVerifyUser {
   execute(dto: verifyUserDTO): Promise<{ firstName: string; lastName?: string; email: string }>;
}
