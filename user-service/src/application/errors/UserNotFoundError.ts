import { AppError } from 'humane-common';

export class UserNotFoundError extends AppError {
   public statusCode = 404;
   constructor(public message: string = 'Invalid/Non-Existant user') {
      super(message);
      Object.setPrototypeOf(this, UserNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
