import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export const messsageNotFoundErrorMessage = {
   NOT_FOUND: 'message not found',
};

export class MessageNotFoundError extends AppError {
   public statusCode = HttpStatusCode.NotFound;
   constructor(public message: string = messsageNotFoundErrorMessage.NOT_FOUND) {
      super(message);
      Object.setPrototypeOf(this, MessageNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
