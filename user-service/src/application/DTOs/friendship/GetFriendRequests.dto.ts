import { User } from '@domain/entities/user.entity';
import { z } from 'zod';

export const getFriendRequestInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastUserId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetFriendRequestListInputDTO = z.infer<typeof getFriendRequestInputSchema>;

export type FriendRequestList = (Pick<User, 'id' | 'firstName' | 'lastName'> & {
   createdAt: string;
   avatarURL: string | null;
})[];
