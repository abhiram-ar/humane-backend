import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { FriendshipStatus } from '@domain/entities/friendship.entity';
import { User } from '@domain/entities/user.entity';
import { z } from 'zod';

export const getFriendsListInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetFriendListInputDTO = z.infer<typeof getFriendsListInputSchema>;

// ---------------list outout------------------
export type FriendList = (Pick<User, 'id' | 'firstName' | 'lastName'> & {
   createdAt: string;
   status: FriendshipStatus;
   avatarURL: string | null;
})[];

export type GetFriendListOutputDTO = {
   friends: FriendList;
   from: UserListInfinityScollParams;
};

// -------------------count-----------------------
export const getFriendsCountInputSchema = z.object({
   userId: z.string().nonempty(),
});
export type GetFriendCountInputDTO = z.infer<typeof getFriendsCountInputSchema>;
