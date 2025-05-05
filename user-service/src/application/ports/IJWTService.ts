export interface IJWTService {
   sign(data: object, secret: string, expiresIn: number): string; // expires in seconds
   verify<T>(token: string, secret: string): T;
}
