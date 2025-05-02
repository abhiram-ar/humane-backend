import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { AnonJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { JWTService } from '@infrastructure/service/JWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { ResolveAnoymousUser } from '../anonymous/ResolveAnonymousUser.usecase';
import { CreateAnonymousUser } from '../anonymous/CreateAnonymousUser.usercase';

export class RefreshUserAccessToken {
   constructor(
      private readonly userReporitory: IUserRepository,
      private readonly jwtService: JWTService,
      private readonly resolveAnonUser: ResolveAnoymousUser,
      private readonly createAnonUser: CreateAnonymousUser
   ) {}

   execute = async (refreshToken: string): Promise<{ newAccessToken: string }> => {
      let verifedTokenPayload: AnonJWTTokenPayload;

      try {
         verifedTokenPayload = this.jwtService.verify<AnonJWTTokenPayload>(
            refreshToken,
            ENV.REFRESH_TOKEN_SECRET as string
         );
      } catch (error) {
         throw new JWTRefreshError('Invalid/Expired refresh token');
      }

      // todo: retirve userId by anonID
      const anonUser = await this.resolveAnonUser.execute(verifedTokenPayload.anonId);
      if (!anonUser) {
         throw new UserNotFoundError('anon record missing, cannot resolve anon user');
      }

      const userStatus = await this.userReporitory.getUserStatusById(anonUser.userId);

      if (!userStatus) {
         throw new UserNotFoundError(
            'Cannot find user while refreshing token, user might be removed from DB'
         );
      }

      if (userStatus.isBlocked) {
         throw new UserBlockedError('Cannot refresh token of a blocked user');
      }

      let newTokenPaylod = verifedTokenPayload;

      if (
         anonUser.expiresAt > Date.now() ||
         anonUser.expiresAt - anonUser.createdAt < 1000 * 60 * 60
      ) {
         const newAnon = await this.createAnonUser.execute(anonUser.userId);
         newTokenPaylod = {
            anonId: newAnon.anonId,
            createdAt: newAnon.createdAt,
            expiresAt: newAnon.expiresAt,
            revoked: newAnon.revoked,
            type: 'anon',
         };
      }

      // create new anonId, if old one is expired or if expires in < 1hr

      const newAccessToken = this.jwtService.sign(
         newTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      return { newAccessToken };
   };
}
