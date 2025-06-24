import { AppError } from 'humane-common';

export class PostDoesNotExistError extends AppError {
   public statusCode = 404;
   constructor(public message: string = 'Post does not exist') {
      super(message);
      Object.setPrototypeOf(this, PostDoesNotExistError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
