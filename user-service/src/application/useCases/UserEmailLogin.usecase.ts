import { ENV } from '../../config/env';
import { userLoginDTO } from '../DTOs/user/userLogin.dto';
import { PasswordError } from '../errors/PasswordError';
import { UserBlockedError } from '../errors/UserBlockedError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { IHashService } from '../ports/IHashService';
import { IJWTService } from '../ports/IJWTService';
import { IUserRepository } from '../ports/IUserRepository';
import { JWTTokenPaylod } from './../types/JWTTokenPayload.type';
import {
   JWT_ACCESS_TOKEN_EXPIRY_SECONDS,
   JWT_REFRESH_TOKEN_EXPIRY_SECONDS,
} from '../../config/jwt';

export class UserEmailLogin {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly hasingService: IHashService,
      private readonly jwtService: IJWTService
   ) {}

   execute = async (dto: userLoginDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      const user = await this.userRepository.retriveUserByEmail(dto.email);
      if (!user) {
         throw new UserNotFoundError('Invalid user trying to authenticate');
      }

      if (user.isBlocked) {
         throw new UserBlockedError('Cannot login, user is blocked');
      }

      if (!user.passwordHash) {
         throw new PasswordError(
            'User has no password, Account might be created Using Social Auth'
         );
      }

      const passwordMatch = this.hasingService.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
         throw new PasswordError('password does not match');
      }

      // create anon id
      // todo: replace this with real annon is
      let anonId = user.id;

      // create JWT
      const jwtTokenPaylod: JWTTokenPaylod = { anonId, type: 'user' };

      const accessToken = this.jwtService.sign(
         jwtTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this.jwtService.sign(
         jwtTokenPaylod,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
