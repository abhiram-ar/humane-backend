class Anon {
  constructor(
    public id: string,
    public userId: string,
    public revoked: boolean,
    public createdAt: Date,
    public expiresAt: Date
  ) {}
}
