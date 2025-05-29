import {
   UserListInfinityScollFromParam,
   UserListInfinityScollParams,
} from '@application/types/UserListInfinityScrollParams.type';
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
      from: UserListInfinityScollFromParam,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }>;

   getUserSendFriendRequestList(
      userId: string,
      from: UserListInfinityScollFromParam,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }>;

   getUserFriendList(
      userId: string,
      from: UserListInfinityScollFromParam,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }>;
   getUserFriendCount(userId: string): Promise<number>;

   findMutualFriends(
      currentUserId: string,
      targetUserId: string,
      from: UserListInfinityScollFromParam,
      size: number
   ): Promise<{
      mutualUsers: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }>;

   countMutualFriends(currentUserId: string, targetUserId: string): Promise<number>;
}
