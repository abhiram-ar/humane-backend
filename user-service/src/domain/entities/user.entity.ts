export class User {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public avatar: string,
    public coverPhoto: string,
    public humanScore: number,
    public lastLoginTime: Date,
    public isHotUser: boolean,
    public passwordHash?: string,
    public bio?: string,
    public createdAt?: Date
  ) {}
}
