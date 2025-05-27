import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';
import { Friendship, FriendshipStatus } from '@domain/entities/friendship.entity';
import { User } from '@domain/entities/user.entity';

export interface IFriendshipRepository {
   addFriendRequest(
      friendship: Friendship,
      requesterId: string,
      recieverId: string
   ): Promise<Required<Friendship>>;

   retriveFriendship(user1: string, user2: string): Promise<Required<Friendship> | null>;

   updateFriendRequest(friendship: Friendship): Promise<Required<Friendship> | null>;

   deleteFriendship(friendship: Friendship): Promise<Required<Friendship>>;

   getUserFriendRequestList(
      userId: string,
      from: UserListInfinityScollParams,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
         createdAt: string;
         status: FriendshipStatus;
      })[];
      from: UserListInfinityScollParams;
   }>;

   getUserFriendList(
      userId: string,
      from: UserListInfinityScollParams,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
         createdAt: string;
         status: FriendshipStatus;
      })[];
      from: UserListInfinityScollParams;
   }>;
}
