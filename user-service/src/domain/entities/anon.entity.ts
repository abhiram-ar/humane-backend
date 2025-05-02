export class Anonymous {
   constructor(
      public readonly anonId: string,
      public readonly userId: string,
      public readonly expiresAt: number, //unix epoch in ms
      public readonly createdAt: number, // unix epoch in ms
      public revoked: boolean = false
   ) {}

   static readonly ANON_EXPIRY_TIME_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24; // 24hrs

   validate = (): boolean => {
      return this.expiresAt < this.createdAt;
   };
}
