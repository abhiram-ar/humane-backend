import { Reward } from '@domain/Reward.entity';
import { IBaseRepository } from './IBaseRepository';
import { RewardType } from '../../../../generated/prisma';

export interface IRewardRepostory extends IBaseRepository<Reward> {
   findLastReward(dto: { type: RewardType; userId: string }): Promise<Required<Reward> | null>;
   platformTotalRewards(dto: { from?: Date; filter?: RewardType }): Promise<number>;
}
