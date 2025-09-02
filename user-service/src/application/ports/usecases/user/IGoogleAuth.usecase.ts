import { googleAuthDTO } from '@application/DTO-mapper/user/googleAuth.dto';

export interface IUserGoogleAuth {
   execute(dto: googleAuthDTO): Promise<{ accessToken: string; refreshToken: string }>;
}
