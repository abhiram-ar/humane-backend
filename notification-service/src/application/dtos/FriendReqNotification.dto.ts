import { FriendshipEventPayload } from 'humane-common';
import { z } from 'zod';

export const FriendhipSchema = z.object({
   id: z.string().nonempty(),
   user1Id: z.string().nonempty(),
   user2Id: z.string().nonempty(),
   status: z.enum(['PENDING', 'ACCEPTED']),
   requesterId: z.string().nonempty(),
   receiverId: z.string().nonempty(),
   createdAt: z.string().nonempty(),
   updatedAt: z.string().optional(),
});

export const friendReqNotificationInputSchema = z.object({
   friendship: FriendhipSchema,
   eventCreatedAt: z.string(),
});

export type FriendReqNotificationInputDTO = z.infer<typeof friendReqNotificationInputSchema>;

const assertTypeCompatibility: <
   T extends { friendship: FriendshipEventPayload; eventCreatedAt: string }
>() => void = () => {};

assertTypeCompatibility<FriendReqNotificationInputDTO>();
