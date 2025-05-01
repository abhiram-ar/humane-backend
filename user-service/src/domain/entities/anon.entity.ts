export class Anonymous {
   constructor(
      public anonId: string,
      public userId: string,
      public revoked: boolean,
      public createdAt: number,
      public expiresAt: number
   ) {}

   static readonly ANON_EXPIRY_TIME_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24; // 24hrs
}
