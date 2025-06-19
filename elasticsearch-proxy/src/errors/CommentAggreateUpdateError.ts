import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export class CommentAggreagateUpdateError extends AppError {
   public statusCode = HttpStatusCode.BadRequest;
   constructor(public message: string = 'Error while updating commnent count aggretation') {
      super(message);
      Object.setPrototypeOf(this, CommentAggreagateUpdateError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
