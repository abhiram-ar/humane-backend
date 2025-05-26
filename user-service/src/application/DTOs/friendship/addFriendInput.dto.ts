import { z } from 'zod';

export const SendFriendRequestInputSchema = z.object({
   requesterId: z.string().nonempty(),
   recieverId: z.string().nonempty(),
});

export type SendFriendRequestInputDTO = z.infer<typeof SendFriendRequestInputSchema>;
