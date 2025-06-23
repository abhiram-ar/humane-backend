import { AppError } from 'humane-common';

export class CommentLikeBulkInsertError extends AppError {
   public statusCode = 500;
   constructor(
      public message: string = 'Erorr while bulk inserting comment likes, (possible reason: like repository throwed an uncauth error)'
   ) {
      super(message);
      Object.setPrototypeOf(this, CommentLikeBulkInsertError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
