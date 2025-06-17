import { JWTTokenPaylod } from '@application/types/JWTTokenPayload.type';

export interface IVerifyAccessToken {
   execute(accessToken: string): JWTTokenPaylod;
}
