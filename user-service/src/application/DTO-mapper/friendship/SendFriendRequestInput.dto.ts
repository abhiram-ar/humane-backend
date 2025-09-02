import { z } from 'zod';

export const sendFriendRequestInputSchema = z.object({
   requesterId: z.string().nonempty(),
   recieverId: z.string().nonempty(),
});

export type SendFriendRequestInputDTO = z.infer<typeof sendFriendRequestInputSchema>;
