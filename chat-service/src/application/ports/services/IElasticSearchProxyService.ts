import { BasicUserDetails } from '@application/Types/BasicUserDetails.type';

export interface IElasticSearchProxyService {
   getUserBasicDetails(userIds: string | string[]): Promise<(BasicUserDetails | null)[]>;
}
