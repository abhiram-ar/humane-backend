import { AppError } from 'humane-common';

export class PostNotFoundError extends AppError {
   public statusCode = 404;
   constructor(public message: string = 'Invalid post') {
      super(message);
      Object.setPrototypeOf(this, PostNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
