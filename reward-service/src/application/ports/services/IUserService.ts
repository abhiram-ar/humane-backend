import { RelationshipStatus } from 'humane-common';

export interface IUserServices {
   getRelationshipStatus(
      currentUserId: string,
      targetUserId: string
   ): Promise<RelationshipStatus | null>;
}
