import { Comment } from '@application/dtos/Comment.dto';
import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { Post } from '@application/Types/PostDetails';

export interface IElasticSearchProxyService {
   getUserBasicDetails(userIds: string | string[]): Promise<(BasicUserDetails | null)[]>;
   getPostsDetailsWithoutAuthorDetailsHydration(
      postIds: string | string[]
   ): Promise<(Post | null)[]>;
   getCommnetDetailsFromIds(commentIds: string | string[]): Promise<(Comment | null)[]>;
}
