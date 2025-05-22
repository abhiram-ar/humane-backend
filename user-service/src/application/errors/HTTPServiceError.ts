import { AppError } from './AppError.abstract';

export class HTTPServiceError extends AppError {
   public statusCode = 500;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, HTTPServiceError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
