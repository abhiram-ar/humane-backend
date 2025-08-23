import { RewardError, RewardErrorMsg } from '@application/errors/FriendshipError';
import { logger } from '@config/logger';
import { DefaultRewardPoints, RewardConfi, RewardPoints } from '@domain/RewardConfig';
import { IRewardConfigRepositoy } from '@ports/repository/IRewardConfigRepository';
import { IRewardConfigServices } from '@ports/usecases/reward/IRewardConfigService';

export class RewardConfigServices implements IRewardConfigServices {
   constructor(private readonly rewardConfigRepo: IRewardConfigRepositoy) {}

   initializeRewardAmount = async () => {
      for (const { type, value } of DefaultRewardPoints) {
         const exists = await this.rewardConfigRepo.get(type);
         if (!exists) {
            logger.debug(`reward entry ${type} does not exist...trying to create one`);
            const rewardConfig = new RewardConfi(type, value);
            await this.rewardConfigRepo.create(rewardConfig);
            logger.info(`successfully created reward entry ${type} with default value ${value}`);
         }
      }
   };

   getRewardAmount = async (type: keyof RewardPoints): Promise<number> => {
      // TODO: implement Read through cache

      let res = await this.rewardConfigRepo.get(type);
      if (!res) {
         logger.error(new RewardError(RewardErrorMsg.NO_REWARD_CONFIG));
         logger.warn('Manually crashing the process');
         process.exit(1);
      }
      return res.amount;
   };

   setAmount = async (type: keyof RewardPoints, amount: number): Promise<RewardConfi> => {
      return await this.rewardConfigRepo.setAmount({ type, amount });
   };
}
