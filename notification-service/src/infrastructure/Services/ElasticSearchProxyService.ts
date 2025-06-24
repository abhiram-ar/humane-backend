import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { Post } from '@application/Types/PostDetails';
import { axiosESproxyService } from '@infrastructure/http/axiosESproxy';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { GetUserBasicDetailsResponse } from '@presentation/event/Types/GetUserBasicDetails Response';
import { GetPostsAPIResponse } from './Types/HydratePostResponse';

export class ElasticSearchProxyService implements IElasticSearchProxyService {
   getUserBasicDetails = async (
      userIds: string | string[]
   ): Promise<(BasicUserDetails | null)[]> => {
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
      const res = await axiosESproxyService.get<GetPostsAPIResponse>(
         '/api/v1/query/internal/post',
         {
            params: { postId: postIds },
            paramsSerializer: { indexes: null },
         }
      );
      return res.data.data.posts;
   };
}
