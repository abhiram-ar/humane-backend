import { AppError } from "humane-common";

export class UserBlockedError extends AppError {
   public statusCode = 403;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, UserBlockedError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: 'User is blocked by platform',
         },
      ];
   }
}
