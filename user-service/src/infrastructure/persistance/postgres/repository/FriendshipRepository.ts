import { Friendship } from '@domain/entities/friendship.entity';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';

export class PostgresFriendshipRepository implements IFriendshipRepository {
   addFriendRequest(
      friendship: Friendship,
      requesterId: string,
      recieverId: string
   ): Promise<Required<Friendship>> {
      throw new Error('Method not implemented.');
   }
   retriveFriendship(user1: string, user2: string): Promise<Required<Friendship> | null> {
      throw new Error('Method not implemented.');
   }
}
