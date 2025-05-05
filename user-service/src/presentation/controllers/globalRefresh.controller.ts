import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { JWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { RefreshAdminAccessToken } from '@application/useCases/admin/RefreshAdminToken.usecase';
import { RefreshUserAccessToken } from '@application/useCases/user/RefreshUserToken.usecase';
import { ENV } from '@config/env';
import { IJWTService } from '@ports/IJWTService';
import { Request, Response, NextFunction } from 'express';

export class GlobalRefreshController {
   constructor(
      private readonly jwtService: IJWTService,
      private readonly refreshAdminToken: RefreshAdminAccessToken,
      private readonly refreshUserToken: RefreshUserAccessToken
   ) {}

   refresh = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { refreshJWT } = req.cookies;
         if (!refreshJWT) {
            throw new UnAuthenticatedError('refresh token not found in cookies');
         }

         let payload: JWTTokenPaylod;
         try {
            payload = this.jwtService.verify<JWTTokenPaylod>(
               refreshJWT,
               ENV.REFRESH_TOKEN_SECRET as string
            );
         } catch (error) {
            throw new JWTRefreshError('Invalid/Expired refresh token - preUserTypeIsolation');
         }

         let newToken: string;

         if (payload.type === 'admin') {
            const { newAccessToken } = await this.refreshAdminToken.execute(refreshJWT);
            newToken = newAccessToken;
         } else if (payload.type === 'anon') {
            const { newAccessToken } = await this.refreshUserToken.execute(refreshJWT);
            newToken = newAccessToken;
         } else {
            throw new JWTRefreshError('Invalid token type');
         }

         res.status(200).json({
            success: true,
            message: 'Access token refreshed',
            data: { token: newToken },
         });
      } catch (error) {
         if (
            error instanceof JWTRefreshError ||
            error instanceof UserNotFoundError ||
            error instanceof UserBlockedError
         ) {
            console.error(error.message);
            res.clearCookie('refreshJWT', {
               httpOnly: true,
               secure: ENV.NODE_ENV === 'production' ? true : false,
               sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            });
         }
         next(error);
      }
   };
}
