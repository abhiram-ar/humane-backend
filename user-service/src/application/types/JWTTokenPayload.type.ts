import { Anonymous } from '@domain/entities/anon.entity';

export type SafeAnon = Pick<Anonymous, 'anonId' | 'createdAt' | 'expiresAt' | 'revoked'>;
export type AnonJWTTokenPayload = SafeAnon & {
   type: 'anon';
};

export type AdminJWTTokenPaylod = {
   adminId: string;
   type: 'admin';
};

export type JWTTokenPaylod = AdminJWTTokenPaylod | AnonJWTTokenPayload;

export type JWTTokenPaylodTypeField = JWTTokenPaylod['type'];
