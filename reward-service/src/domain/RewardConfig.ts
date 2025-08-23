import { RewardError, RewardErrorMsg } from '@application/errors/FriendshipError';

export type RewardPoints = {
   HELPFUL_COMMENT: number;
   CHAT_CHECKIN: number;
};

export const DefaultRewardPoints: { type: keyof RewardPoints; value: number }[] = [
   { type: 'HELPFUL_COMMENT', value: 30 },
   { type: 'CHAT_CHECKIN', value: 10 },
];

export class RewardConfi {
   public readonly type: keyof RewardPoints;
   public amount: number;

   constructor(type: keyof RewardPoints, amount: number) {
      if (amount < 0) throw new RewardError(RewardErrorMsg.NEGATIVE_REWARD_AMOUNT);
      this.type = type;
      this.amount = amount;
   }
}
