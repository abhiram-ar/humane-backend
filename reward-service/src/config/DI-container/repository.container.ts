import { HumaneScoreRepository } from '@infrastructure/persistance/postgres/repository/HumaneScore.repository';
import { RewardConfigRepository } from '@infrastructure/persistance/postgres/repository/RewardConfig.repository';
import { RewardRepository } from '@infrastructure/persistance/postgres/repository/RewardsRepository';

export const rewardRepository = new RewardRepository();
export const humaneScoreRepository = new HumaneScoreRepository();

export const rewardConfigRepository = new RewardConfigRepository();
