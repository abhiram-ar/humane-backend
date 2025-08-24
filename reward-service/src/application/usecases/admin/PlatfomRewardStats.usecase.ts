import { PlatfromRewardStatsOutputDTO } from '@application/dto/PlatformRewardStats';
import { IRewardRepostory } from '@ports/repository/IRewardRepository';
import { IPlatformRewardStats } from '@ports/usecases/admin/IPlatformRewardStats.usecase';

export class PlatformRewardStats implements IPlatformRewardStats {
   constructor(private readonly _rewardRepo: IRewardRepostory) {}

   execute = async (): Promise<PlatfromRewardStatsOutputDTO> => {
      const time24hrsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
      const time48hrsAgo = new Date(Date.now() - 1000 * 60 * 60 * 48);

      return {
         chatRewards: {
            inLast24hrs: await this._rewardRepo.platformTotalRewards({
               from: time24hrsAgo,
               filter: 'CHAT_CHECKIN',
            }),
            inLast48hrs: await this._rewardRepo.platformTotalRewards({
               from: time48hrsAgo,
               filter: 'CHAT_CHECKIN',
            }),
         },
         postRewards: {
            inLast24hrs: await this._rewardRepo.platformTotalRewards({
               from: time24hrsAgo,
               filter: 'HELPFUL_COMMENT',
            }),
            inLast48hrs: await this._rewardRepo.platformTotalRewards({
               from: time48hrsAgo,
               filter: 'HELPFUL_COMMENT',
            }),
         },

         totalRewards: {
            total: await this._rewardRepo.platformTotalRewards({}),
            inLast24hrs: await this._rewardRepo.platformTotalRewards({ from: time24hrsAgo }),
            inLast48hrs: await this._rewardRepo.platformTotalRewards({ from: time48hrsAgo }),
         },
      };
   };
}
