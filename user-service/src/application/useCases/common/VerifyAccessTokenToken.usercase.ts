import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { JWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { IJWTService } from '@ports/IJWTService';

export class VerifyAccessToken {
   constructor(private readonly _jwtService: IJWTService) {}

   execute = (accessToken: string): JWTTokenPaylod => {
      let tokenPayload: JWTTokenPaylod;
      try {
         tokenPayload = this._jwtService.verify<JWTTokenPaylod>(
            accessToken,
            ENV.ACCESS_TOKEN_SECRET as string
         );
      } catch (error) {
         throw new UnAuthenticatedError('Invalid/Expired accessToken');
      }

      return tokenPayload;
   };
}
