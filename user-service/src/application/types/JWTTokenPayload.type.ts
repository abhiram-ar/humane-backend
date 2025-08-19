export type UserJWTTokenPayload = {
   userId: string;
   type: 'user';
   iss: 'humane';
};

export type AdminJWTTokenPaylod = {
   adminId: string;
   type: 'admin';
   iss: 'humane';
};

export type JWTTokenPaylod = AdminJWTTokenPaylod | UserJWTTokenPayload;

export type JWTTokenPaylodTypeField = JWTTokenPaylod['type'];
