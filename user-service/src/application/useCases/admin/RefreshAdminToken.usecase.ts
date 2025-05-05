import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { AdminJWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { JWTService } from '@infrastructure/service/JWTService';

export class RefreshAdminAccessToken {
   constructor(private readonly jwtService: JWTService) {}

   execute = async (refreshToken: string): Promise<{ newAccessToken: string }> => {
      let verifedTokenPayload: AdminJWTTokenPaylod;

      try {
         verifedTokenPayload = this.jwtService.verify<AdminJWTTokenPaylod>(
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
      };

      const newAccessToken = this.jwtService.sign(
         newTokenPaylod,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      return { newAccessToken };
   };
}
