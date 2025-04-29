export class User {
  constructor(
    public id: string,
    public firstName: string,
    public email: string,
    public humaneScore: number = 0,
    public isHotUser: boolean = false,
    public lastLoginTime?: Date,
    public avatar?: string,
    public coverPhoto?: string,
    public lastName?: string,
    public passwordHash?: string,
    public bio?: string,
    public createdAt?: Date
  ) {}
}
