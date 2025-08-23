import { PlatformRewardStats } from '@application/usecases/admin/PlatfomRewardStats.usecase';
import { rewardRepository } from '@di/repository.container';

export const platformRewardStats = new PlatformRewardStats(rewardRepository);
