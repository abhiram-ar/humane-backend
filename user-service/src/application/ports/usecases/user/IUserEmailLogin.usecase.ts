import { userLoginDTO } from '@application/DTO-mapper/user/userLogin.dto';

export interface IUserEmailLogin {
   execute(dto: userLoginDTO): Promise<{ accessToken: string; refreshToken: string }>;
}
