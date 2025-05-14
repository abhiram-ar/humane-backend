import { UserBlockedError } from '@application/errors/UserBlockedError';
import { AnonJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { IUserRepository } from '@ports/IUserRepository';
import { CreateAnonymousUser } from '../anonymous/CreateAnonymousUser.usercase';
import { Anonymous } from '@domain/entities/anon.entity';
import { IJWTService } from '@ports/IJWTService';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS, JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { GenericError } from '@application/errors/GenericError';

export class UserGoogleAuth {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _createAnon: CreateAnonymousUser,
      private readonly _jetService: IJWTService
   ) {}

   execute = async (dto: googleAuthDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      let user = await this._userRepository.retriveUserByEmail(dto.email);

      if (!user) {
         user = await this._userRepository.googleAuthCreate(dto);
      }

      if (user.isBlocked) {
         throw new UserBlockedError('User is blocked, cannot do social auth');
      }

      const anon = await this._createAnon.execute(user.id);
      if (!anon) {
         throw new GenericError('cannot create annon');
      }

      const tokenPayload: AnonJWTTokenPayload = {
         anonId: anon.anonId,
         type: 'anon',
         revoked: false,
         createdAt: Date.now(),
         expiresAt: Date.now() + Anonymous.ANON_EXPIRY_TIME_IN_MILLI_SECONDS,
      };

      const accessToken = this._jetService.sign(
         tokenPayload,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this._jetService.sign(
         tokenPayload,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
