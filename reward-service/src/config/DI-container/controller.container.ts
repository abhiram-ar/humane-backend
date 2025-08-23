import { HumaneScoreController } from '@presentation/http/Controller/HumaneScore.controller';
import { humaneScoreServices } from './usecase/humaneScore.usercase.container';
import { AdminController } from '@presentation/http/Controller/Admin.Controller';
import { platformRewardStats } from './usecase/admin.usercase.container';
import { rewardConfigServices } from './usecase/reward.usecase.constiner';

export const humaneScoreController = new HumaneScoreController(humaneScoreServices);

export const adminController = new AdminController(platformRewardStats, rewardConfigServices);
