import { AppError } from "humane-common";

export class FriendReqAcceptedNotificationError extends AppError {
   public statusCode = 400;
   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, FriendReqAcceptedNotificationError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
