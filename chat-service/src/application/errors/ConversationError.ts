import { AppError } from 'humane-common';

export const conversationErrorMessages = {
   INVALID_ONE_TO_ONE_COVERSATION_BY_PARTIPIPANTS:
      'invalid one to one conversation, less/more than 2 participants one the conversation',
};

export class ConversationError extends AppError {
   public statusCode = 400;
   constructor(
      public message:
         | (typeof conversationErrorMessages)[keyof typeof conversationErrorMessages]
         | string
   ) {
      super(message);
      Object.setPrototypeOf(this, ConversationError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
