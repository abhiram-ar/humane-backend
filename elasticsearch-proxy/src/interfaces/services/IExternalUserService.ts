import { RelationshipStatus } from 'humane-common';

export interface IExternalUserServices {
   getRelationshipStatus(currentUserId: string, targetUserId: string): Promise<RelationshipStatus>;
}
