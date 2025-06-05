import { BasicUserDetails } from '@application/Types/BasicUserDetails';
import { axiosESproxyService } from '@infrastructure/http/axiosESproxy';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';
import { GetUserBasicDetailsResponse } from '@presentation/event/Types/GetUserBasicDetails Response';

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
}
