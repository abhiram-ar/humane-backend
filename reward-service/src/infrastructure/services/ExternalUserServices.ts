import { ENV } from '@config/env';
import axios, { HttpStatusCode } from 'axios';
import { RelationshipStatus } from 'humane-common';
import { RelationshipStatusResponse } from './Types/GetRelationshipStatus.type';
import { IUserServices } from '@ports/services/IUserService';
import { AxiosError } from 'axios';

export class ExternalUserServices implements IUserServices {
   getRelationshipStatus = async (
      currentUserId: string,
      targetUserId: string
   ): Promise<RelationshipStatus | null> => {
      try {
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
      } catch (e) {
         if (e instanceof AxiosError && e.response?.status === HttpStatusCode.NotFound) {
            return null;
         }

         throw e;
      }
   };
}
