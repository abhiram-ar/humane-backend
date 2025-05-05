import { AppError } from './AppError.abstract';

export class GenericError extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, GenericError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
