import { AppError } from "humane-common";

export class MailServiceError extends AppError {
   public statusCode = 500;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, MailServiceError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
            field: 'mail',
         },
      ];
   }
}
