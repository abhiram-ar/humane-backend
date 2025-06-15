import { AppError } from "humane-common";

export class UnAuthenticatedError extends AppError {
   public statusCode = 401;
   constructor(public message: string = 'No userId in auth header') {
      super(message);
      Object.setPrototypeOf(this, UnAuthenticatedError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
