export class User {
   constructor(
      public id: string,
      public firstName: string,
      public email: string,
      public isEmailVerified: boolean = false,
      public isBlocked: boolean = false,
      public humaneScore: number = 0,
      public isHotUser: boolean = false,
      public createdAt: string,
      public lastLoginTime?: string | null,
      public avatarKey?: string | null,
      public coverPhotoKey?: string | null,
      public lastName?: string | null,
      public passwordHash?: string,
      public bio?: string | null
   ) {}
}
