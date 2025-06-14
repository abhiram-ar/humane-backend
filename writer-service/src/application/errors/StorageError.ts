import { AppError } from 'humane-common';

export class StorageError extends AppError {
   public statusCode = 500;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, StorageError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
