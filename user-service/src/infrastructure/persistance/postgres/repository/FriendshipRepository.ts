import { Friendship } from '@domain/entities/friendship.entity';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import db from '../prisma-client';

export class PostgresFriendshipRepository implements IFriendshipRepository {
   addFriendRequest = async (
      friendship: Friendship,
      requesterId: string,
      recieverId: string
   ): Promise<Required<Friendship>> => {
      const res = await db.friendShip.create({
         data: {
            user1Id: friendship.user1Id,
            user2Id: friendship.user2Id,
            requesterId: requesterId,
            receiverId: recieverId,
            status: friendship.status,
         },
      });

      return {
         ...res,
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };
   };
   retriveFriendship = async (
      user1Id: string,
      user2Id: string
   ): Promise<Required<Friendship> | null> => {
      const res = await db.friendShip.findUnique({
         where: { user1Id_user2Id: { user1Id: user1Id, user2Id: user2Id } },
      });

      if (!res) return null;

      return {
         ...res,
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };
   };
}
