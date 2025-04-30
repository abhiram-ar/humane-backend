import { AppError } from './AppError.abstract';

export class OTPError extends AppError {
   constructor(public message: string) {
      super('otp error');
      Object.setPrototypeOf(this, OTPError.prototype);
   }
   statusCode = 400;

   serialize(): { message: string; toastMessage?: boolean; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
