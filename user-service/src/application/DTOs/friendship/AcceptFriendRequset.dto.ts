import { z } from 'zod';

export const acceptFriendRequestSchema = z.object({
   userId: z.string().nonempty(),
   requesterId: z.string().nonempty(),
});

export type AcceptFriendshipInputDTO = z.infer<typeof acceptFriendRequestSchema>;
