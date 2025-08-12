import { AppError } from 'humane-common';

export class ModelNotLoadedError extends AppError {
   public statusCode = 500;
   constructor(public message: string = 'Model not loaded') {
      super(message);
      Object.setPrototypeOf(this, ModelNotLoadedError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
