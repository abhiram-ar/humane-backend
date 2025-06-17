import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export class InvalidUserIdsFormatError extends AppError {
   public statusCode = HttpStatusCode.BadRequest;
   constructor(public message: string = 'Invalid userId type for this query') {
      super(message);
      Object.setPrototypeOf(this, InvalidUserIdsFormatError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
