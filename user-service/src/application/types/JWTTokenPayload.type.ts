export type UserJWTTokenPayload = {
   userId: string;
   type: 'user';
};

export type AdminJWTTokenPaylod = {
   adminId: string;
   type: 'admin';
};

export type JWTTokenPaylod = AdminJWTTokenPaylod | UserJWTTokenPayload;

export type JWTTokenPaylodTypeField = JWTTokenPaylod['type'];
