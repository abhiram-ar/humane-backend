import { FriendshipStatus } from '@domain/entities/friendship.entity';
import { User } from '@domain/entities/user.entity';
import { z } from 'zod';

export const getFriendInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetFriendListInputDTO = z.infer<typeof getFriendInputSchema>;

export type FriendList = (Pick<User, 'id' | 'firstName' | 'lastName'> & {
   createdAt: string;
   status: FriendshipStatus;
   avatarURL: string | null;
})[];
