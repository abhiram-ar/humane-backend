import { GetUserStatsOutputDTO } from '@application/DTO-mapper/admin/userStats.dto';

export interface IUsersStat {
   execute(): Promise<GetUserStatsOutputDTO>;
}
