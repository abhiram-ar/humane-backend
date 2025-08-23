import { PlatfromRewardStatsOutputDTO } from '@application/dto/PlatformRewardStats';

export interface IPlatformRewardStats {
   execute(): Promise<PlatfromRewardStatsOutputDTO>;
}
