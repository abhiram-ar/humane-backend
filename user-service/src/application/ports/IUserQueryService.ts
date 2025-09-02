import { SearchUserResponse } from '@application/types/SearchUserResponse';
import { GetUserDTO } from '@application/DTO-mapper/admin/getUsers.dto';

export interface IUserQueryService {
   searchUser(dto: GetUserDTO): Promise<SearchUserResponse>;
}
