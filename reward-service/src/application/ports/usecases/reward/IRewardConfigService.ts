import { RewardConfi, RewardPoints } from '@domain/RewardConfig';

export interface IRewardConfigServices {
   initializeRewardAmount(): Promise<void>;

   getRewardAmount(type: keyof RewardPoints): Promise<number>;

   setAmount(type: keyof RewardPoints, amount: number): Promise<RewardConfi>;
}
