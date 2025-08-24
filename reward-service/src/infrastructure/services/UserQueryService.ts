import { HTTPServiceError } from '@application/errors/HTTPServiceError';
import { BasicUserDetails } from '@application/types/BasicUserDetails';
import { SearchUserResponse } from '@application/types/SearchUserResponse';
import { ENV } from '@config/env';
import { logger } from '@config/logger';
import { SearchUserRequest, IUserQueryService } from '@ports/usecases/IUserQueryService';
import axios from 'axios';
import { GetUserBasicDetailsResponse } from './Types/GetUserBasicDetails Response';

export class UserQueryService implements IUserQueryService {
   private readonly BASE_URL = ENV.ELASTICSEARCH_PROXY_BASE_URL;
   constructor() {}
   getUserBasicDetails = async (
      userIds: string | string[]
   ): Promise<(BasicUserDetails | null)[]> => {
      if (!userIds || userIds.length === 0) return [];
      const response = await axios.get<GetUserBasicDetailsResponse>(
         `${this.BASE_URL}/api/v1/query/public/user/basic`,
         {
            params: { userId: userIds },
            paramsSerializer: { indexes: null }, // remove user1[]=fsfsdf&user2[]=fsdfsdf issue
         }
      );

      return response.data.data.user;
   };
   searchUser = async (dto: SearchUserRequest): Promise<SearchUserResponse> => {
      try {
         const res = await axios.get<SearchUserResponse>(
            `${this.BASE_URL}/api/v1/query/internal/user`,
            { params: dto }
         );

         return res.data;
      } catch (error) {
         logger.error(error);
         throw new HTTPServiceError('Error fetching data from es proxy');
      }
   };
}
