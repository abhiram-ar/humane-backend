import { IUserService } from '@ports/IUserService';
import axios from 'axios';
import { GetFullFriendsResponse } from './Types/GetUserFriendsResponse';
import { ENV } from '@config/env';

export class UserServices implements IUserService {
   getAllFriendsNonHotUser = async (
      userId: string
   ): Promise<{ isHotUser: true } | { isHotUser: false; friends: string[] }> => {
      const res = await axios.get<GetFullFriendsResponse>(
         `${ENV.USER_SERVICE_BASE_URL}/api/v1/internal/user/${userId}/friends`
      );

      return res.data.data;
   };
}
