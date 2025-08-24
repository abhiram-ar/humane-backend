import { AppError } from 'humane-common';

export const UnAuthenticatedErrorMsgs = {
   COOKIE_REFRESH_TOKEN_NOT_FOUND: 'refresh token not found in cookies',
   USER_NOT_AUTHENTICATED: 'User not authenticated',
} as const;

export class UnAuthenticatedError extends AppError {
   public statusCode = 401;
   constructor(
      public message:
         | (typeof UnAuthenticatedErrorMsgs)[keyof typeof UnAuthenticatedErrorMsgs]
         | string = UnAuthenticatedErrorMsgs.USER_NOT_AUTHENTICATED
   ) {
      super(message);
      Object.setPrototypeOf(this, UnAuthenticatedError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
