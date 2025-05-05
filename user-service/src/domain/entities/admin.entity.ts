export class Admin {
   constructor(
      public readonly id: string,
      public readonly email: string,
      public firstName: string,
      public lastName: string,
      public passwordHash: string
   ) {}
}
