export const RewardType = {
   HELPFUL_COMMENT: 30,
   CHAT_DAILY_CHECKIN: 10,
} as const;

export class Reward {
   public createdAt?: Date;
   constructor(
      public actorId: string,
      public idempotencyKey: string,
      public type: keyof typeof RewardType,
      public pointsRewarded: (typeof RewardType)[keyof typeof RewardType]
   ) {
      if (pointsRewarded < 1) {
         throw new Error('reward point should be a positive a number');
      }
   }
}
