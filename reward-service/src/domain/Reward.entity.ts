import { RewardPoints } from './RewardConfig';

export class Reward {
   public createdAt?: Date;
   constructor(
      public actorId: string,
      public idempotencyKey: string,
      public type: keyof RewardPoints,
      public readonly pointsRewarded: number
   ) {}
}
