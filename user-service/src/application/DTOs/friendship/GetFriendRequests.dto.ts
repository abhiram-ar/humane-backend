import { User } from '@domain/entities/user.entity';
import { z } from 'zod';
import { RelationshipStatus } from '@application/types/RelationshipStatus';

// ---------------------list------------------------
export const getFriendRequestInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetFriendRequestListInputDTO = z.infer<typeof getFriendRequestInputSchema>;

export type FriendRequestList = (Pick<User, 'id' | 'firstName' | 'lastName'> & {
   createdAt: string;
   status: RelationshipStatus;
   avatarURL: string | null;
})[];

// -------------------count-----------------------
export const getFriendsRequestCountInputSchema = z.object({
   userId: z.string().nonempty(),
});
export type GetFriendRequestCountInputDTO = z.infer<typeof getFriendsRequestCountInputSchema>;
