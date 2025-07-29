import { AppError } from 'humane-common';

export const ESProxyErrorMsgs = {
   USER_SEARCH_FAILED: 'failed while seaching for user',
} as const;

export class ESProxyError extends AppError {
   public statusCode = 500;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, ESProxyError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
