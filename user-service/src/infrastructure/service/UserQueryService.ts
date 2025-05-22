import { HTTPServiceError } from '@application/errors/HTTPServiceError';
import { SearchUserResponse } from '@application/types/SearchUserResponse';
import { ENV } from '@config/env';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';
import { IHTTPService } from '@ports/IHTTPService';
import { IUserQueryService } from '@ports/IUserQueryService';

export class UserQueryService implements IUserQueryService {
   private readonly BASE_URL = ENV.ELASTICSEARCH_PROXY_BASE_URL;
   constructor(private readonly _httpService: IHTTPService) {}
   searchUser = async (dto: GetUserDTO): Promise<SearchUserResponse> => {
      const res = await this._httpService.get<SearchUserResponse>(
         `${this.BASE_URL}/api/v1/query/internal/user`,
         { params: dto }
      );

      if (!res.success) {
         throw new HTTPServiceError('error fetching data from read model');
      }

      return res.data;
   };
}

