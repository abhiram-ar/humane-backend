import { AppError } from '../../application/errors/AppError.abstract';
import { ZodError } from 'zod';

export class ZodValidationError extends AppError {
   public statusCode = 400;

   constructor(public zodErrors: ZodError) {
      super('Zod error');
      Object.setPrototypeOf(this, ZodValidationError.prototype);
   }

   serialize(): { message: string; toastMessage?: boolean; field?: string }[] {
      const errors = this.zodErrors.errors.map((error) => {
         return { message: error.message, field: String(error.path) };
      });
      return errors;
   }
}
