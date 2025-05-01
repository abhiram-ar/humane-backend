export type UserJWTTokenPayload = {
   anonId: string;
   type: 'user';
};

export type AdminJWTTokenPaylod = {
   adminId: string;
   type: 'admin';
};

export type JWTTokenPaylod = UserJWTTokenPayload | AdminJWTTokenPaylod;
