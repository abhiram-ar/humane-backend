import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';
import { IElasticSearchProxyService } from '@ports/services/IElasticSearchProxyService';
import { GetUserBasicDetailsResponse } from './Types/GetBasicUserDetailsAPIResponse.type';
import { ESproxyAPIClient } from '@infrastructure/http/ESproxyAPIClient';

export class ElasticSearchProxyService implements IElasticSearchProxyService {
   getUserBasicDetails = async (
      userIds: string | string[]
   ): Promise<(BasicUserDetails | null)[]> => {
      if (!userIds || userIds.length === 0) return [];
      const response = await ESproxyAPIClient.get<GetUserBasicDetailsResponse>(
         '/api/v1/query/public/user/basic',
         {
            params: { userId: userIds },
            paramsSerializer: { indexes: null }, // remove user1[]=fsfsdf&user2[]=fsdfsdf issue
         }
      );

      return response.data.data.user;
   };
}
