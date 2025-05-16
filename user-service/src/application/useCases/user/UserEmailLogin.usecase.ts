import { ENV } from '@config/env';
import { userLoginDTO } from '@application/DTOs/user/userLogin.dto';
import { PasswordError } from '@application/errors/PasswordError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { IHashService } from '@ports/IHashService';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { UserJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS, JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { EmailError } from '@application/errors/EmailError';

export class UserEmailLogin {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _hasingService: IHashService,
      private readonly _jwtService: IJWTService // private readonly createAnonUser: CreateAnonymousUser
   ) {}

   execute = async (dto: userLoginDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      const user = await this._userRepository.retriveUserByEmail(dto.email);
      if (!user) {
         throw new EmailError('Email does not exist, create an account.');
      }

      if (user.isBlocked) {
         throw new UserBlockedError('Cannot login, user is blocked');
      }

      if (!user.passwordHash) {
         throw new PasswordError('Account has no password, try social Auth');
      }

      const passwordMatch = await this._hasingService.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
         throw new PasswordError('password does not match');
      }

      // create JWT
      const jwtTokenPaylod: UserJWTTokenPayload = {
         userId: user.id,
         type: 'user',
      };

      const accessToken = this._jwtService.sign(
         jwtTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this._jwtService.sign(
         jwtTokenPaylod,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
