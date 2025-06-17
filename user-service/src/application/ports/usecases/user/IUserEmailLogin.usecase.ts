import { userLoginDTO } from '@dtos/user/userLogin.dto';

export interface IUserEmailLogin {
   execute(dto: userLoginDTO): Promise<{ accessToken: string; refreshToken: string }>;
}
