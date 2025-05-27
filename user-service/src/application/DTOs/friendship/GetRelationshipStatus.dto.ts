import { z } from 'zod';

export const getRelationshipStatusSchema = z.object({
   currentUserId: z.string(),
   targetUserId: z.string(),
});

export type GetRelationShipStatusInputDTO = z.infer<typeof getRelationshipStatusSchema>;

export type GetRelationShipStatusOutputDTO =
   | 'strangers'
   | 'friends'
   | 'friendreqSend'
   | 'friendReqWaitingApproval'
   | 'blocked';
