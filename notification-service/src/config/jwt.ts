import { VerifyAccessToken, JWTService } from 'humane-common';

export const jwtService = new JWTService();
export const verifyAccessToken = new VerifyAccessToken(jwtService);
