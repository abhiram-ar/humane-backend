export const EntityType = {
   POST: 'post',
   COMMENT: 'comment',
} as const;

export class Likes {
   public readonly createdAt?: Date;
   public updatedAt?: Date;
   constructor(public entityType: (typeof EntityType)[keyof typeof EntityType], count: number) {
      if (count < 0) {
         throw new Error('post/comment likes cannot be negative ');
      }
   }
}
