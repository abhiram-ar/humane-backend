import { Friendship } from '@domain/entities/friendship.entity';

export interface IFriendshipRepository {
   addFriendRequest(
      friendship: Friendship,
      requesterId: string,
      recieverId: string
   ): Promise<Required<Friendship>>;

   retriveFriendship(user1: string, user2: string): Promise<Required<Friendship> | null>;
}
