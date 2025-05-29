import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
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
      avatarURL: string | null;
   })[];
   from: UserListInfinityScollParams;
};

export const mutualFriendsCountInputSchema = z.object({
   currentUserId: z.string().nonempty(),
   targetUserId: z.string().nonempty(),
});
export type MutualFriendsCountInputDTO = z.infer<typeof mutualFriendsCountInputSchema>;
