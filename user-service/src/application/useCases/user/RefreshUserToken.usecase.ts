import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { UserJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { JWTService } from '@infrastructure/service/JWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { IRefreshUserAccessToken } from '@ports/usecases/user/IRefreshUserToken.usecase';

export class RefreshUserAccessToken implements IRefreshUserAccessToken {
   constructor(
      private readonly _userReporitory: IUserRepository,
      private readonly _jwtService: JWTService
   ) {}

   execute = async (refreshToken: string): Promise<{ newAccessToken: string }> => {
      let verifedTokenPayload: UserJWTTokenPayload;

      try {
         verifedTokenPayload = this._jwtService.verify<UserJWTTokenPayload>(
            refreshToken,
            ENV.REFRESH_TOKEN_SECRET as string
         );
      } catch (error) {
         throw new JWTRefreshError('Invalid/Expired refresh token');
      }

      const userStatus = await this._userReporitory.getUserStatusById(verifedTokenPayload.userId);

      if (!userStatus) {
         throw new UserNotFoundError(
            'Cannot find user while refreshing token, user might be removed from DB'
         );
      }

      if (userStatus.isBlocked) {
         throw new UserBlockedError('Cannot refresh token of a blocked user');
      }

      // we cannot reuse the old verifiedTokenPaylod,
      // as it contain additonal fields after verifing including old token expiry
      let newTokenPaylod: UserJWTTokenPayload = {
         userId: userStatus.id,
         type: 'user',
         iss: 'humane'
      };

      const newAccessToken = this._jwtService.sign(
         newTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      return { newAccessToken };
   };
}
