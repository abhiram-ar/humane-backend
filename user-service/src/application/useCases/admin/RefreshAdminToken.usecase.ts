import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { AdminJWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { IJWTService } from '@ports/IJWTService';
import { IRefreshAdminAccessToken } from '@ports/usecases/admin/IRefreshAdminToken.usecase';

export class RefreshAdminAccessToken implements IRefreshAdminAccessToken {
   constructor(private readonly _jwtService: IJWTService) {}

   execute = async (refreshToken: string): Promise<{ newAccessToken: string }> => {
      let verifedTokenPayload: AdminJWTTokenPaylod;

      try {
         verifedTokenPayload = this._jwtService.verify<AdminJWTTokenPaylod>(
            refreshToken,
            ENV.REFRESH_TOKEN_SECRET as string
         );
      } catch (error) {
         throw new JWTRefreshError('Invalid/Expired refresh token');
      }

      // we cannot reuse the old verifiedTokenPaylod,
      // as it contain additonal fields after verifing including old token expiry
      let newTokenPaylod: AdminJWTTokenPaylod = {
         adminId: verifedTokenPayload.adminId,
         type: 'admin',
         iss: 'humane',
      };

      const newAccessToken = this._jwtService.sign(
         newTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      return { newAccessToken };
   };
}
