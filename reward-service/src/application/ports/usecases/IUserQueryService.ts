import { BasicUserDetails } from '@application/types/BasicUserDetails';
import { SearchUserResponse } from '@application/types/SearchUserResponse';

export type SearchUserRequest = {
   searchQuery?: string;
   page: number;
   limit: number;
};

export interface IUserQueryService {
   searchUser(dto: SearchUserRequest): Promise<SearchUserResponse>;
   getUserBasicDetails(userIds: string | string[]): Promise<(BasicUserDetails | null)[]>;
}
