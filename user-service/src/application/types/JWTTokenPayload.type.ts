type UserJWTTokenPayload = {
   anonId: string;
   type: 'user';
};

type AdminJWTTokenPaylod = {
   adminId: string;
   type: 'admin';
};

export type JWTTokenPaylod = UserJWTTokenPayload | AdminJWTTokenPaylod;
