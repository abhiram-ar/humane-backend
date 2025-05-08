import { VerifyAccessToken } from '@application/useCases/common/VerifyAccessTokenToken.usercase';
import { jwtService } from '@di/services.container';

export const verifyAccessToken = new VerifyAccessToken(jwtService);
