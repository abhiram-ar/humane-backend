import { HttpStatusCode } from 'axios';
import { AppError } from 'humane-common';

export const conversationNotFoundErrorMessage = {
   NOT_FOUND: 'conversation not found',
};

export class ConversationNotFoundError extends AppError {
   public statusCode = HttpStatusCode.NotFound;
   constructor(public message: string = conversationNotFoundErrorMessage.NOT_FOUND) {
      super(message);
      Object.setPrototypeOf(this, ConversationNotFoundError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
