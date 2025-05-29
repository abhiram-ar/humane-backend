import { AppError } from './AppError.abstract';

export class RelationshipBlockedError extends AppError {
   public statusCode = 403;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, RelationshipBlockedError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: 'User is blocked by other user',
         },
      ];
   }
}
