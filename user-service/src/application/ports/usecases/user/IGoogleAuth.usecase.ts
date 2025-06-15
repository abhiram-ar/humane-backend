import { googleAuthDTO } from '@dtos/user/googleAuth.dto';

export interface IUserGoogleAuth {
   execute(dto: googleAuthDTO): Promise<{ accessToken: string; refreshToken: string }>;
}
