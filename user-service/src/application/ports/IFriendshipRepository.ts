import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { Friendship } from '@domain/entities/friendship.entity';
import { User } from '@domain/entities/user.entity';

export interface IFriendshipRepository {
   addFriendRequest(
      friendship: Friendship,
      requesterId: string,
      recieverId: string
   ): Promise<Required<Friendship>>;

   retriveFriendship(user1: string, user2: string): Promise<Required<Friendship> | null>;

   updateFriendRequest(friendship: Friendship): Promise<Required<Friendship> | null>;

   getUserFriendRequestList(
      userId: string,
      from: UserListInfinityScollParams,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
         createdAt: string;
      })[];
      from: UserListInfinityScollParams;
   }>;
}
