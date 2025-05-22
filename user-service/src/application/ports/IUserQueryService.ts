import { SearchUserResponse } from '@application/types/SearchUserResponse';
import { GetUserDTO } from '@dtos/admin/getUsers.dto';

export interface IUserQueryService {
   searchUser(dto: GetUserDTO): Promise<SearchUserResponse>;
}
