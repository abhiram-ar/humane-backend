import { AppError } from "humane-common";

export class PasswordError extends AppError {
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, PasswordError.prototype);
   }
   statusCode = 400;

   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
            field: 'password',
         },
      ];
   }
}
