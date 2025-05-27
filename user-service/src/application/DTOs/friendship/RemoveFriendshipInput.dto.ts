import { z } from 'zod';

export const removeFriendshipInputSchema = z.object({
   currenUserId: z.string().nonempty(),
   targetUserId: z.string().nonempty(),
});

export type RemoveFriendshipInputDTO = z.infer<typeof removeFriendshipInputSchema>;
