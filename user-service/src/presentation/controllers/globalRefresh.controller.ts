import { JWTRefreshError } from '@application/errors/JWTRefreshError';
import { UnAuthenticatedError } from '@application/errors/UnAuthenticatedError';
import { UserBlockedError } from '@application/errors/UserBlockedError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { JWTTokenPaylod } from '@application/types/JWTTokenPayload.type';
import { ENV } from '@config/env';
import { logger } from '@config/logger';
import { IJWTService } from '@ports/IJWTService';
import { IRefreshAdminAccessToken } from '@ports/usecases/admin/IRefreshAdminToken.usecase';
import { IRefreshUserAccessToken } from '@ports/usecases/user/IRefreshUserToken.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

export class GlobalRefreshController {
   constructor(
      private readonly _jwtService: IJWTService,
      private readonly _refreshAdminToken: IRefreshAdminAccessToken,
      private readonly _refreshUserToken: IRefreshUserAccessToken
   ) {}

   refresh = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { refreshJWT } = req.cookies;
         if (!refreshJWT) {
            throw new UnAuthenticatedError('refresh token not found in cookies');
         }

         let payload: JWTTokenPaylod;
         try {
            payload = this._jwtService.verify<JWTTokenPaylod>(
               refreshJWT,
               ENV.REFRESH_TOKEN_SECRET as string
            );
         } catch (error) {
            throw new JWTRefreshError('Invalid/Expired refresh token - preUserTypeIsolation');
         }

         let newToken: string;

         if (payload.type === 'admin') {
            const { newAccessToken } = await this._refreshAdminToken.execute(refreshJWT);
            newToken = newAccessToken;
         } else if (payload.type === 'user') {
            const { newAccessToken } = await this._refreshUserToken.execute(refreshJWT);
            newToken = newAccessToken;
         } else {
            throw new JWTRefreshError('Invalid token type');
         }

         res.status(HttpStatusCode.Ok).json({
            data: { token: newToken },
         });
      } catch (error) {
         if (
            error instanceof JWTRefreshError ||
            error instanceof UserNotFoundError ||
            error instanceof UserBlockedError
         ) {
            logger.error(error.message);
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
