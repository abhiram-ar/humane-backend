import { User } from '@domain/entities/user.entity';
import { z } from 'zod';
import { RelationshipStatus } from '@application/types/RelationshipStatus';

export const getUserSendFriendRequestInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.object({ createdAt: z.string(), lastId: z.string() }).nullable(),
   size: z.number().nonnegative(),
});

export type GetUserSendFriendRequestListInputDTO = z.infer<
   typeof getUserSendFriendRequestInputSchema
>;

export type FriendRequestList = (Pick<User, 'id' | 'firstName' | 'lastName'> & {
   createdAt: string;
   status: RelationshipStatus;
   avatarURL: string | null;
})[];
