import { AppError } from './AppError.abstract';

export class JWTRefreshError extends AppError {
   public statusCode = 403;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, JWTRefreshError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
            field: 'refreshJWT',
         },
      ];
   }
}
