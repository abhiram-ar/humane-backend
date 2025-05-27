import { z } from 'zod';

export const cancelFriendRequestInputSchema = z.object({
   requesterId: z.string().nonempty(),
   recieverId: z.string().nonempty(),
});

export type cancelFriendRequestInputDTO = z.infer<typeof cancelFriendRequestInputSchema>;
