import { z } from 'zod';

export const getFriendRequestInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastUserId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetFriendRequestListInputDTO = z.infer<typeof getFriendRequestInputSchema>;
