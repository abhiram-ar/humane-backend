import { RewardConfig } from '../../../../generated/prisma';
import { IBaseRepository } from './IBaseRepository';

export interface IRewardConfigRepositoy extends IBaseRepository<RewardConfig> {
   setAmount(entity: RewardConfig): Promise<RewardConfig>;
   findAll(): Promise<RewardConfig[]>;
}
