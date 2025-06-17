import { HydratedPost } from '@application/Types/HydratedPost';

export interface IESproxyService {
   getPostsDetail: (postIds: string[]) => Promise<(HydratedPost | null)[]>;
}
