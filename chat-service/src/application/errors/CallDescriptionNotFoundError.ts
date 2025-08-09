import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export const callDescriptionNotFoundErrorMessage = {
   NOT_FOUND: 'call description not found',
};

export class CallDescriptionNotFoundError extends AppError {
   public statusCode = HttpStatusCode.NotFound;
   constructor(public message: string = callDescriptionNotFoundErrorMessage.NOT_FOUND) {
      super(message);
      Object.setPrototypeOf(this, CallDescriptionNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
