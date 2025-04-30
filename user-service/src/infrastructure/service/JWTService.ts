import JWT from 'jsonwebtoken';
import { IJWTService } from '../../application/ports/IJWTService';

export class JWTService implements IJWTService {
    sign(data: object, secret: string, expiresIn: number): string {
      const token = JWT.sign(data, secret, { expiresIn: expiresIn });
      return token;
   }

   verify<T>(token: string, secret: string): T {
      return JWT.verify(token, secret ) as T
   }
}
