export type FriendshipStatus = 'PENDING' | 'ACCEPTED';

export class Friendship {
   constructor(
      public user1Id: string,
      public user2Id: string,
      public status: FriendshipStatus,
      public id?: string,
      public requesterId?: string,
      public receiverId?: string,
      public createdAt?: string,
      public updatedAt?: string
   ) {
      if (user1Id === user2Id) throw new Error('UserIds must be different');
      if (user1Id > user2Id) {
         [this.user2Id, this.user1Id] = [user1Id, user2Id];
      }
   }

   public static sortUserId(user1Id: string, user2Id: string): [string, string] {
      if (user1Id > user2Id) {
         return [user2Id, user1Id];
      } else {
         return [user1Id, user2Id];
      }
   }
}
