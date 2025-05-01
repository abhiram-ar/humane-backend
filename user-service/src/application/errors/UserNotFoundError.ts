import { AppError } from './AppError.abstract';

export class UserNotFoundError extends AppError {
   public statusCode = 404;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, UserNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: 'Invalid user',
         },
      ];
   }
}
