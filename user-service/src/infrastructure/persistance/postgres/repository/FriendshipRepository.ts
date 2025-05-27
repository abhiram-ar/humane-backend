import { Friendship } from '@domain/entities/friendship.entity';
import { IFriendshipRepository } from '@ports/IFriendshipRepository';
import db from '../prisma-client';
import { User } from '@domain/entities/user.entity';
import { UserListInfinityScollParams } from '@application/types/UserListInfinityScrollParams.type';

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

   updateFriendRequest = async (friendship: Friendship): Promise<Required<Friendship> | null> => {
      const res = await db.friendShip.update({
         where: { user1Id_user2Id: { user1Id: friendship.user1Id, user2Id: friendship.user2Id } },
         data: { status: friendship.status, updatedAt: new Date() },
      });
      if (!res) return null;
      return {
         ...res,
         createdAt: res.createdAt.toISOString(),
         updatedAt: res.updatedAt.toISOString(),
      };
   };

   getUserFriendRequestList = async (
      userId: string,
      from: UserListInfinityScollParams,
      size: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
      })[];
      from: UserListInfinityScollParams;
   }> => {
      const res = await db.friendShip.findMany({
         orderBy: [{ createdAt: 'desc' }, { requesterId: 'asc' }],
         where: {
            receiverId: userId,
            status: 'PENDING',
            createdAt: { lte: from?.createdAt },
            requesterId: { lt: from?.lastUserId },
         },
         select: {
            RequestedUser: {
               select: { id: true, firstName: true, lastName: true, avatarKey: true },
            },
            createdAt: true,
         },
         take: size,
      });

      let parsedFriendRequestList = res.map((entry) => ({
         ...entry.RequestedUser,
         createdAt: entry.createdAt.toISOString(),
      }));

      const lastElem = parsedFriendRequestList[parsedFriendRequestList.length - 1];

      return {
         friendReqs: parsedFriendRequestList,
         from: lastElem ? { createdAt: lastElem.createdAt, lastUserId: lastElem.id } : null,
      };
   };
}
