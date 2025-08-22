import { GetUserStatsOutputDTO } from '@dtos/admin/userStats.dto';

export interface IUsersStat {
   execute(): Promise<GetUserStatsOutputDTO>;
}
