import { AppError } from 'humane-common';

export class AuthorizationError extends AppError {
   public statusCode = 403;
   constructor(
      public message: string = 'Current user type is not authorized to use this resource/endpoint'
   ) {
      super(message);
      Object.setPrototypeOf(this, AuthorizationError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
