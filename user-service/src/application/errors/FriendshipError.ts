import { AppError } from "humane-common";

export class FriendshipError extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, FriendshipError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
