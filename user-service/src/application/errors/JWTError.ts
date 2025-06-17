import { AppError } from "humane-common";

export class JWTError extends AppError {
   public statusCode = 403;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, JWTError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
            field: 'token',
         },
      ];
   }
}
