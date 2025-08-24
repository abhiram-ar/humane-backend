import { PostStatsOutputDTO } from '@application/Types/PostsStat.dto';

export interface IPostsStats {
   execute(): Promise<PostStatsOutputDTO>;
}
