import { SearchUserInputDTO } from '@application/dto/SearchUser.dto';
import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';
import { SearchUserData } from '@application/Types/ESSearchUser.type';

export interface IElasticSearchProxyService {
   getUserBasicDetails(userIds: string | string[]): Promise<(BasicUserDetails | null)[]>;
   searchUser(dto: SearchUserInputDTO): Promise<SearchUserData | null>;
}
