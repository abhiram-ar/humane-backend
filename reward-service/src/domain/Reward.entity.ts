export const RewardPoints = {
   HELPFUL_COMMENT: 30,
   CHAT_CHECKIN: 10,
} as const;

export class Reward {
   public createdAt?: Date;
   public pointsRewarded: number;
   constructor(
      public actorId: string,
      public idempotencyKey: string,
      public type: keyof typeof RewardPoints
   ) {
      this.pointsRewarded = RewardPoints[this.type];
   }
}
