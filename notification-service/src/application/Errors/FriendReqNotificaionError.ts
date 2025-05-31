import { AppError } from "humane-common";

export class FriendReqNotificationError extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, FriendReqNotificationError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
