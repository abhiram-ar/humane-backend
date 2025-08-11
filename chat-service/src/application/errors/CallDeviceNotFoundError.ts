import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export const callDeviceNotFoundErrorMessages = {
   NOT_FOUND: 'call device not found',
};

export class CallDeviceNotFoundError extends AppError {
   public statusCode = HttpStatusCode.NotFound;
   constructor(public message: string = callDeviceNotFoundErrorMessages.NOT_FOUND) {
      super(message);
      Object.setPrototypeOf(this, CallDeviceNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
