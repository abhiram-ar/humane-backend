import { AppError } from './AppError.abstract';

export class JWTError extends AppError {
   public statusCode = 400;

   constructor(public message: string, public error?: object) {
      super(message);
   }
   serialize(): { message: string; toastMessage?: boolean; field?: string }[] {
      return [
         {
            message: 'JWT expired/Invalid',
         },
      ];
   }
}
