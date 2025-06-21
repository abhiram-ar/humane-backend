import { ENV } from '@config/env';
import axios from 'axios';
import { RelationshipStatus } from 'humane-common';
import { IExternalUserServices } from 'interfaces/services/IExternalUserService';
import { RelationshipStatusResponse } from './Types/GetRelationshipStatus.type';

export class ExternalUserServices implements IExternalUserServices {
   getRelationshipStatus = async (
      currentUserId: string,
      targetUserId: string
   ): Promise<RelationshipStatus> => {
      const response = await axios.get<RelationshipStatusResponse>(
         `${ENV.USER_SERVICE_BASE_URL}/api/v1/internal/relationship/status`,
         {
            params: {
               currentUserId,
               targetUserId,
            },
         }
      );

      return response.data.data.status;
   };
}
