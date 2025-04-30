export interface IJWTService {
   sign(data: object, secret: string, expiresIn: number): string;
   verify<T>(token: string, secret: string): T;
}
