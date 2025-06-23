import { RelationshipStatus } from 'humane-common';

export type RelationshipStatusResponse = {
   success: boolean;
   message: string;
   data: { status: RelationshipStatus };
};
