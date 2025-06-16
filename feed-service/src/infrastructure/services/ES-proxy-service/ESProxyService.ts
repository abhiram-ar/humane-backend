import { HydratedPost } from '@application/Types/HydratedPost';
import { IESproxyService } from '@ports/IESproxyService';
import axios from 'axios';
import { HydratePostsAPIResponse } from './Types/HydratePostResponse';
import { ENV } from '@config/env';

export class ESProxyService implements IESproxyService {
   getPostsDetail = async (postIds: string[]): Promise<(HydratedPost | null)[]> => {
      const res = await axios.get<HydratePostsAPIResponse>(
         `${ENV.ELASTICSEARCH_PROXY_BASE_URL}/api/v1/query/internal/post`,
         {
            params: { postId: postIds },
            paramsSerializer: { indexes: null },
         }
      );
      return res.data.data.posts;
   };
}
