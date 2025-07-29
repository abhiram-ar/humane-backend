import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';
import { IElasticSearchProxyService } from '@ports/services/IElasticSearchProxyService';
import { GetUserBasicDetailsResponse } from './Types/GetBasicUserDetailsAPIResponse.type';
import { ESproxyAPIClient } from '@infrastructure/http/ESproxyAPIClient';
import { SearchUserConvoInputDTO } from '@application/dto/SearchUserConvo.dto';
import { SearchUserData } from '@application/Types/ESSearchUser.type';
import { SearchUserAPIResponse } from './Types/SearchUserAPIResponse';

export class ElasticSearchProxyService implements IElasticSearchProxyService {
   searchUser = async (dto: SearchUserConvoInputDTO): Promise<SearchUserData | null> => {
      try {
         const result = await ESproxyAPIClient.get<SearchUserAPIResponse>(
            `/api/v1/query/internal/user`,
            { params: dto }
         );
         return result.data.data;
      } catch (error) {
         return null;
      }
   };
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
