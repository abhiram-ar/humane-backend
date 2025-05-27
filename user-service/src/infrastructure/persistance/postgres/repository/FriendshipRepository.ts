import { Friendship, FriendshipStatus } from '@domain/entities/friendship.entity';
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

   deleteFriendship = async (friendship: Friendship): Promise<Required<Friendship>> => {
      const res = await db.friendShip.delete({
         where: { user1Id_user2Id: { user1Id: friendship.user1Id, user2Id: friendship.user2Id } },
      });

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
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }> => {
      const res = await db.friendShip.findMany({
         orderBy: [{ createdAt: 'desc' }, { requesterId: 'asc' }],
         where: {
            receiverId: userId,
            status: 'PENDING',
            createdAt: { lte: from?.createdAt },
            requesterId: { gt: from?.lastId },
         },
         select: {
            RequestedUser: {
               select: { id: true, firstName: true, lastName: true, avatarKey: true },
            },
            createdAt: true,
            status: true,
         },
         take: size,
      });

      let parsedFriendRequestList = res.map((entry) => ({
         ...entry.RequestedUser,
         createdAt: entry.createdAt.toISOString(),
         status: entry.status,
      }));

      const lastElem = parsedFriendRequestList[parsedFriendRequestList.length - 1];

      return {
         friendReqs: parsedFriendRequestList,
         from: lastElem ? { createdAt: lastElem.createdAt, lastId: lastElem.id } : null,
      };
   };

   getUserFriendList = async (
      userId: string,
      from: UserListInfinityScollParams,
      size?: number
   ): Promise<{
      friendReqs: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }> => {
      const res = await db.friendShip.findMany({
         orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
         where: {
            OR: [
               { requesterId: userId, status: 'ACCEPTED' },
               { receiverId: userId, status: 'ACCEPTED' },
            ],
            createdAt: { lte: from?.createdAt },
            id: { gt: from?.lastId },
         },
         select: {
            user1: {
               select: { id: true, firstName: true, lastName: true, avatarKey: true },
            },
            user2: {
               select: { id: true, firstName: true, lastName: true, avatarKey: true },
            },
            createdAt: true,
            status: true,
         },
         take: size,
      });

      const parsedUserList = res.map((entry) => {
         // friend can be either of user1 or user2
         const friend = entry.user1.id === userId ? entry.user2 : entry.user1;

         return { ...friend, createdAt: entry.createdAt.toISOString(), status: entry.status };
      });

      const lastElem = parsedUserList[parsedUserList.length - 1];

      return {
         friendReqs: parsedUserList,
         from: lastElem ? { createdAt: lastElem.createdAt, lastId: lastElem.id } : null,
      };
   };

   getUserFriendCount = async (userId: string): Promise<number> => {
      const res = await db.friendShip.count({
         where: {
            OR: [
               { requesterId: userId, status: 'ACCEPTED' },
               { receiverId: userId, status: 'ACCEPTED' },
            ],
         },
      });

      return res;
   };

   findMutualFriends = async (
      currentUserId: string,
      targetUserId: string,
      from: UserListInfinityScollParams,
      size: number
   ): Promise<{
      mutualUsers: (Pick<User, 'id' | 'firstName' | 'lastName'> & {
         createdAt: string;
         status: FriendshipStatus;
         avatarKey: string | null;
      })[];
      from: UserListInfinityScollParams;
   }> => {
      const res = await db.friendShip.findMany({
         orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
         where: {
            AND: [
               // and ensure that we will get the interseaction of both friend list
               {
                  OR: [
                     // friends of current user
                     { user1Id: currentUserId, status: 'ACCEPTED' },
                     { user2Id: currentUserId, status: 'ACCEPTED' },
                  ],
               },
               {
                  OR: [
                     // frinds of target user
                     { user1Id: targetUserId, status: 'ACCEPTED' },
                     { user2Id: targetUserId, status: 'ACCEPTED' },
                  ],
               },
            ],
            createdAt: { lte: from?.createdAt },
            id: { gt: from?.lastId },
         },
         take: size,
         select: {
            user1: { select: { id: true, firstName: true, lastName: true, avatarKey: true } },
            user2: { select: { id: true, firstName: true, lastName: true, avatarKey: true } },
            createdAt: true,
            status: true,
         },
      });

      const parsedUserList = res.map((entry) => {
         // friend can be either of user1 or user2
         const friend =
            entry.user1.id === currentUserId || entry.user1.id === targetUserId
               ? entry.user2
               : entry.user1;

         return { ...friend, createdAt: entry.createdAt.toISOString(), status: entry.status };
      });

      const lastElem = parsedUserList[parsedUserList.length - 1];

      return {
         mutualUsers: parsedUserList,
         from: lastElem ? { createdAt: lastElem.createdAt, lastId: lastElem.id } : null,
      };
   };

   countMutualFriends = async (currentUserId: string, targetUserId: string): Promise<number> => {
      const res = await db.friendShip.count({
         where: {
            AND: [
               // and ensure that we will get the interseaction of both friend list
               {
                  OR: [
                     // friends of current user
                     { user1Id: currentUserId, status: 'ACCEPTED' },
                     { user2Id: currentUserId, status: 'ACCEPTED' },
                  ],
               },
               {
                  OR: [
                     // frinds of target user
                     { user1Id: targetUserId, status: 'ACCEPTED' },
                     { user2Id: targetUserId, status: 'ACCEPTED' },
                  ],
               },
            ],
         },
      });

      return res;
   };
}
