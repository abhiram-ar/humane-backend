import { AppError } from './AppError.abstract';

export class EmailError extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, EmailError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
            field: 'email',
         },
      ];
   }
}
