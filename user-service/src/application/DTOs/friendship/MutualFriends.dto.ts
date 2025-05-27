import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { FriendshipStatus } from '@domain/entities/friendship.entity';
import { User } from '@domain/entities/user.entity';
import { z } from 'zod';

export const mutualFriendsListInputSchema = z.object({
   currentUserId: z.string().nonempty(),
   targetUserId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type MutualFriendsListInputDTO = z.infer<typeof mutualFriendsListInputSchema>;

export type MutualFriendsListOutputDTO = {
   mutualFriends: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
      createdAt: string;
      status: FriendshipStatus;
      avatarURL: string | null;
   })[];
   from: UserListInfinityScollParams;
};
