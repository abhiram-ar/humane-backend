class Anonymous {
   constructor(
      public anonId: string,
      public userId: string,
      public revoked: boolean,
      public createdAt: Date,
      public expiresAt: Date
   ) {}
}
