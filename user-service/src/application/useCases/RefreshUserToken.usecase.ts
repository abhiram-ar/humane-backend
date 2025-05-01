import { ENV } from '../../config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS } from '../../config/jwt';
import { JWTService } from '../../infrastructure/service/JWTService';
import { UserBlockedError } from '../errors/UserBlockedError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { IUserRepository } from '../ports/IUserRepository';
import { JWTTokenPaylod, UserJWTTokenPayload } from '../types/JWTTokenPayload.type';

class RefreshUserToken {
   constructor(
      private readonly userReporitory: IUserRepository,
      private readonly jwtService: JWTService
   ) {}

   execute = async (refreshToken: string): Promise<{ newAccessToken: string }> => {
      let verifedTokenPayload: UserJWTTokenPayload;

      try {
         verifedTokenPayload = this.jwtService.verify<UserJWTTokenPayload>(
            refreshToken,
            ENV.REFRESH_TOKEN_SECRET as string
         );
      } catch (error) {
         // todo: Refresh token error
         throw new Error('Invalid refresh token');
      }

      // todo: retirve userId by anonID
      const userId = verifedTokenPayload.anonId;
      const userStatus = await this.userReporitory.getUserStatusById(userId);

      if (!userStatus) {
         throw new UserNotFoundError(
            'Cannot find user while refreshing token, user might be removed from DB'
         );
      }

      if (userStatus.isBlocked) {
         throw new UserBlockedError('Cannot refresh token of a blocked user');
      }

      // create new anonId, old one is expired or if expires in < 1hr
      const tokenPayload: JWTTokenPaylod = { anonId: verifedTokenPayload.anonId, type: 'user' };
      const newAccessToken = this.jwtService.sign(
         tokenPayload,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      return { newAccessToken };
   };
}
