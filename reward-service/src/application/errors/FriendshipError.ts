import { AppError } from 'humane-common';

export const RewardErrorMsg = {
   NOT_FRIENDS: 'Cannot issue reward if the parties are not friends',
   FAILED_TO_CREATE: 'unable to create a reward',
   CHAT_REWARED_RATE_LIMIT: 'user rewared in rate limited',
   NEGATIVE_REWARD_AMOUNT: 'Reward amount cannot be negative',
   NO_REWARD_CONFIG: 'Reward config not found',
} as const;
export class RewardError extends AppError {
   public statusCode = 400;
   constructor(public message: (typeof RewardErrorMsg)[keyof typeof RewardErrorMsg]) {
      super(message);
      Object.setPrototypeOf(this, RewardError.prototype);
   }
   serialize(): { message: string; field?: string }[] {
      return [
         {
            message: this.message,
         },
      ];
   }
}
