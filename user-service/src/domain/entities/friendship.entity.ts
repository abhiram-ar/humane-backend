type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export class Friendship {
   constructor(
      public userId1: string,
      public userId2: string,
      public status: FriendshipStatus,
      public requesterId?: string,
      public recieverId?: string,
      public createdAt?: string,
      public updatedAt?: string
   ) {
      if (userId1 === userId2) throw new Error('UserIds must be different');
      if (userId1 > userId2) {
         [this.userId2, this.userId1] = [userId1, userId2];
      }
   }
}
