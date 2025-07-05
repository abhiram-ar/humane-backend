import { HumaneScoreRepository } from '@infrastructure/persistance/postgres/repository/HumaneScore.repository';
import { RewardRepository } from '@infrastructure/persistance/postgres/repository/RewardsRepository';

export const rewardRepository = new RewardRepository();
export const humaneScoreRepository = new HumaneScoreRepository();
