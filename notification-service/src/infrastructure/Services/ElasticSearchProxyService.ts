import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { Post } from '@application/Types/PostDetails';
import { axiosESproxyService } from '@infrastructure/http/axiosESproxy';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { GetUserBasicDetailsResponse } from '@presentation/event/Types/GetUserBasicDetails Response';
import { GetPostsAPIResponse } from './Types/GetPostAPIResponse';

export class ElasticSearchProxyService implements IElasticSearchProxyService {
   getUserBasicDetails = async (
      userIds: string | string[]
   ): Promise<(BasicUserDetails | null)[]> => {
      if (!userIds || userIds.length === 0) return [];
      const response = await axiosESproxyService.get<GetUserBasicDetailsResponse>(
         '/api/v1/query/public/user/basic',
         {
            params: { userId: userIds },
            paramsSerializer: { indexes: null }, // remove user1[]=fsfsdf&user2[]=fsdfsdf issue
         }
      );

      return response.data.data.user;
   };

   getPostsDetailsWithoutAuthorDetailsHydration = async (
      postIds: string | string[]
   ): Promise<(Post | null)[]> => {
      if (!postIds || postIds.length === 0) return [];
      const res = await axiosESproxyService.get<GetPostsAPIResponse>(
         '/api/v1/query/internal/post',
         {
            params: { postId: postIds, noAuthorHydration: 1 },
            paramsSerializer: { indexes: null },
         }
      );
      return res.data.data.posts;
   };
}
