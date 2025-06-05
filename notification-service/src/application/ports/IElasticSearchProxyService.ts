import { BasicUserDetails } from '@application/Types/BasicUserDetails';

export interface IElasticSearchProxyService {
   getUserBasicDetails(userIds: string | string[]): Promise<(BasicUserDetails | null)[]>;
}
