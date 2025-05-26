type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'STRANGERS';

export class Friendship {
   constructor(public userId1: string, public userId2: string, public status: FriendshipStatus) {
      if (userId1 === userId2) throw new Error('UserIds must be different');
      if (userId1 > userId2) {
         [this.userId2, this.userId1] = [userId1, userId2];
      }
   }
}
