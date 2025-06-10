import { AppError } from 'humane-common';

export class EntityNotFound extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, EntityNotFound.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
