export class Admin {
   constructor(
      public readonly id: string,
      public readonly email: string,
      public firstName: string,
      public passwordHash: string,
      public lastName?: string
   ) {}
}
