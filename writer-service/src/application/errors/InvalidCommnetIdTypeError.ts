import { AppError } from 'humane-common';

export class InvalidCommentIdTypeError extends AppError {
   public statusCode = 400;
   constructor(public message: string = 'CommnetId should be a string or an array of strings') {
      super(message);
      Object.setPrototypeOf(this, InvalidCommentIdTypeError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
